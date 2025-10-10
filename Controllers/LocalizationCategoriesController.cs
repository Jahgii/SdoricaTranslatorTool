using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;
using SdoricaTranslatorTool.Services;

namespace SdoricaTranslatorTool.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocalizationCategoriesController(ICustomMongoClient cMongoClient) : Controller
{
    readonly ICustomMongoClient _cMongoClient = cMongoClient;

    [HttpGet]
    public async Task<ActionResult> Get()
    {
        var cursor = _cMongoClient.GetCollection<LocalizationCategory>()
            .Find(_ => true)
            .SortBy(e => e.Name);

        var data = await cursor.ToListAsync();

        return Ok(data);
    }

    [HttpPost]
    public async Task<ActionResult> Post(List<LocalizationCategory> categories)
    {
        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();
        foreach (var c in categories)
        {
            if (await VerifiedCategory(c.Name)) continue;

            await _cMongoClient.Create(session, c);
        }

        await session.CommitTransactionAsync();

        return Ok();
    }

    [HttpPost("reset")]
    public async Task<ActionResult> ResetCategories()
    {
        var categories = await _cMongoClient
            .GetCollection<LocalizationCategory>()
            .Find(_ => true)
            .ToListAsync();

        categories.ForEach(async c =>
        {
            foreach (var keyLang in c.Keys)
            {
                c.Keys[keyLang.Key] = (int)await _cMongoClient
                    .GetCollection<LocalizationKey>()
                    .Find(e => e.Category == c.Name)
                    .CountDocumentsAsync();

                c.KeysTranslated[keyLang.Key] = (int)await _cMongoClient
                    .GetCollection<LocalizationKey>()
                    .Find(e => e.Category == c.Name && e.Translated[keyLang.Key])
                    .CountDocumentsAsync();
            }
        });

        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();

        await _cMongoClient.Delete<LocalizationKey>(session, e => e.Name == "");

        foreach (var c in categories)
        {
            await _cMongoClient.Replace<LocalizationCategory>(session, e => e.Id == c.Id, c);
        }

        await session.CommitTransactionAsync();

        return Ok();
    }

    private async Task<bool> VerifiedCategory(string name)
    {
        var query = await _cMongoClient.GetCollection<LocalizationCategory>().FindAsync<LocalizationCategory>(e => e.Name == name);
        var skip = await query.FirstOrDefaultAsync();

        return skip != null;
    }

}
