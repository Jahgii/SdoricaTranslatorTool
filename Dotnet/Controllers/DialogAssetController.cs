using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;
using SdoricaTranslatorTool.Services;

namespace SdoricaTranslatorTool.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DialogAssetsController(ICustomMongoClient cMongoClient, IMemoryCache cache) : ControllerBase
{
    readonly ICustomMongoClient _cMongoClient = cMongoClient;
    readonly IMemoryCache _cache = cache;
    readonly string CacheKey = "Export_Dialogs";

    [HttpGet]
    public async Task<ActionResult> Get([FromHeader] string language, [FromHeader] string mainGroup, [FromHeader] string group)
    {
        var cursor = _cMongoClient.GetCollection<DialogAsset>()
            .Find(e => e.Language == language && e.MainGroup == mainGroup && e.Group == group)
            .SortBy(e => e.Number);
        var data = await cursor.ToListAsync();

        return Ok(data);
    }

    [HttpGet("search")]
    public async Task<ActionResult> Search([FromHeader] string language, [FromHeader] string text)
    {
        var cursor = _cMongoClient.GetCollection<DialogAsset>()
            .Find(e =>
                e.Language == language
                && e.Model.Content.Any(d => d.OriginalText.ToLower().Contains(text.ToLower()))
            )
            .SortBy(e => e.Number);
        var data = await cursor.ToListAsync();

        return Ok(data);
    }

    [HttpGet("searchlang")]
    public async Task<ActionResult> SearchLang(
            [FromHeader] string language,
            [FromHeader] string mainGroup,
            [FromHeader] string group,
            [FromHeader] int number
        )
    {
        var cursor = await _cMongoClient.GetCollection<DialogAsset>()
            .FindAsync(e =>
                e.Language != language &&
                e.MainGroup == mainGroup &&
                e.Group == group &&
                e.Number == number
            );

        var result = await cursor.FirstOrDefaultAsync();

        return Ok(result);
    }

    [HttpGet("searchothers")]
    public async Task<ActionResult> SearchOtherText(
        [FromHeader] string language,
        [FromHeader] string mainGroup,
        [FromHeader] string group,
        [FromHeader] int number,
        [FromHeader] string id
    )
    {
        var cursor = await _cMongoClient.GetCollection<DialogAsset>()
            .FindAsync(e =>
                // e.Language != language &&
                e.MainGroup == mainGroup &&
                e.Group == group &&
                e.Number == number
            // && e.Model.Content.Any(m => m.ID == id)
            );

        var results = await cursor.ToListAsync();

        Dictionary<string, string> LanguageText = [];

        int index = results.Find(e => e.Language == language)?.Model.Content.FindIndex(e => e.ID == id) ?? -1;

        if (index == -1) return NoContent();

        results.ForEach(r =>
        {
            string originalText = r.Model.Content[index].OriginalText ?? "";
            LanguageText.Add(r.Language, originalText);
        });

        return Ok(LanguageText);
    }

    [HttpGet("export")]
    public async Task<ActionResult> GetTranslated()
    {
        if (!_cache.TryGetValue(CacheKey, out List<DialogAsset>? data))
        {
            var cursor = _cMongoClient.GetCollection<DialogAsset>()
                .Find(e => e.Translated);
            data = await cursor.ToListAsync();

            _cache.Set(CacheKey, data, new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.MaxValue));
        }

        return Ok(data);
    }

    [HttpPost]
    [Consumes("application/x-msgpack")]
    [RequestSizeLimit(100 * 1024 * 1024)]
    public async Task<ActionResult> Post([FromHeader] string lang, [FromBody] List<DialogAsset> dialogAssets)
    {
        var dialogLangData = await _cMongoClient
            .GetCollection<DialogAsset>()
            .Aggregate()
            .Match(d => d.Language == lang)
            .Project(e => new { e.OriginalFilename })
            .ToListAsync();

        int dialogsToSkip = 0;
        List<DialogAsset> dialogsToCreate = [];

        for (int i = 0; i < dialogAssets.Count; i++)
        {
            var dialogToCreate = dialogAssets[i];
            var dialogToUpdate = dialogLangData
                .Find(e => e.OriginalFilename == dialogToCreate.OriginalFilename);

            if (dialogToUpdate is not null) dialogsToSkip++;
            else dialogsToCreate.Add(dialogToCreate);
        }

        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();

        if (dialogsToCreate.Count > 0)
        {
            await _cMongoClient.Create<DialogAsset>(session, dialogsToCreate);
            await session.CommitTransactionAsync();
        }

        return Ok(new { FileSkip = dialogsToSkip });
    }

    [HttpPut]
    public async Task<ActionResult> Put(DialogAsset dialogAsset)
    {
        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();

        var group = await _cMongoClient
            .GetCollection<Group>()
            .Find(e => e.OriginalName == dialogAsset.Group && e.Language == dialogAsset.Language && e.MainGroup == dialogAsset.MainGroup)
            .FirstOrDefaultAsync();

        var mainGroup = await _cMongoClient
            .GetCollection<MainGroup>()
            .Find(e => e.OriginalName == dialogAsset.MainGroup && e.Language == dialogAsset.Language)
            .FirstOrDefaultAsync();

        var oldDialog = await _cMongoClient
            .GetCollection<DialogAsset>()
            .Find(e => e.OriginalFilename == dialogAsset.OriginalFilename)
            .FirstOrDefaultAsync();

        if (oldDialog.Translated != dialogAsset.Translated)
        {
            mainGroup.TranslatedFiles += dialogAsset.Translated ? 1 : -1;
            group.TranslatedFiles += dialogAsset.Translated ? 1 : -1;

            if (dialogAsset.Translated) _cache.Remove(CacheKey);
        }

        var updateGroupTranslated = Builders<Group>
            .Update
            .Set(e => e.TranslatedFiles, group.TranslatedFiles);

        var updateMainTranslated = Builders<MainGroup>
            .Update
            .Set(e => e.TranslatedFiles, mainGroup.TranslatedFiles);

        await _cMongoClient.Replace(session, e => e.OriginalFilename == dialogAsset.OriginalFilename, dialogAsset);
        await _cMongoClient.Update(session, e => e.Id == group.Id, updateGroupTranslated);
        await _cMongoClient.Update(session, e => e.Id == mainGroup.Id, updateMainTranslated);

        await session.CommitTransactionAsync();


        return Ok(dialogAsset);
    }
    
}