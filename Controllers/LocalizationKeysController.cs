using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;
using SdoricaTranslatorTool.Services;

namespace SdoricaTranslatorTool.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocalizationKeysController(ICustomMongoClient cMongoClient) : ControllerBase
{
    readonly ICustomMongoClient _cMongoClient = cMongoClient;

    [HttpGet]
    public async Task<ActionResult> Get([FromHeader] string category)
    {
        var cursor = await _cMongoClient.GetCollection<LocalizationKey>().FindAsync(e => e.Category == category);
        var data = await cursor.ToListAsync();
        return Ok(data);
    }

    [HttpGet("search")]
    public async Task<ActionResult> Search([FromHeader] string language, [FromHeader] string text)
    {
        var cursor = await _cMongoClient.GetCollection<LocalizationKey>()
            .FindAsync(e => e.Original[language].ToLower().Contains(text.ToLower()));
        var data = await cursor.ToListAsync();
        return Ok(data);
    }

    [HttpGet("searchkey")]
    public async Task<ActionResult> SearchByKey([FromHeader] string key)
    {
        var cursor = _cMongoClient.GetCollection<LocalizationKey>().Find(e => e.Name.ToLower().Contains(key.ToLower())).SortBy(e => e.Name);
        var data = await cursor.ToListAsync();
        return Ok(data);
    }

    [HttpGet("searchkeyequal")]
    public async Task<ActionResult> SearchByKeyEqual([FromHeader] string category, [FromHeader] string key)
    {
        var cursor = _cMongoClient.GetCollection<LocalizationKey>()
            .Find(e => e.Category == category && e.Name == key);
        var data = await cursor.ToListAsync();
        return Ok(data);
    }

    [HttpGet("searchtranslation")]
    public async Task<ActionResult> SearchByTranslateText([FromHeader] string language, [FromHeader] string text)
    {
        var cursor = await _cMongoClient.GetCollection<LocalizationKey>().FindAsync(e => e.Translations[language].ToLower().Contains(text.ToLower()));
        var data = await cursor.ToListAsync();
        return Ok(data);
    }

    [HttpGet("verified")]
    public async Task<ActionResult> Veried()
    {
        var data = await _cMongoClient.GetCollection<LocalizationKey>().Find(_ => true).FirstOrDefaultAsync();
        if (data == null) return Ok(new { Bulk = true });
        return Ok(new { Bulk = false });
    }

    [HttpGet("export")]
    public async Task<ActionResult> GetExport([FromHeader] string language)
    {
        var cursor = await _cMongoClient.GetCollection<LocalizationKey>().FindAsync(e => e.Translated[language] == true);
        var data = await cursor.ToListAsync();
        return Ok(data);
    }

    [HttpPost]
    public async Task<ActionResult> Post(LocalizationKey key)
    {
        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();

        if (await VerifiedIfKeyExist(key.Category, key.Name)) return Ok();

        await _cMongoClient.Create(session, key);

        var category = await _cMongoClient.GetCollection<LocalizationCategory>()
        .Find(e => e.Name == key.Category)
        .FirstOrDefaultAsync();

        if (category != null)
        {
            foreach (var keyLang in category.Keys)
            {
                category.Keys[keyLang.Key] = (int)await _cMongoClient
                    .GetCollection<LocalizationKey>()
                    .Find(e => e.Category == category.Name)
                    .CountDocumentsAsync() + 1;

                category.KeysTranslated[keyLang.Key] = (int)await _cMongoClient
                    .GetCollection<LocalizationKey>()
                    .Find(e => e.Category == category.Name && e.Translated[keyLang.Key])
                    .CountDocumentsAsync();
            }

            await _cMongoClient.Replace(session, e => e.Id == category.Id, category);
        }

        await session.CommitTransactionAsync();

        return Ok(key);
    }

    [HttpPost("import")]
    public async Task<ActionResult> Post(List<LocalizationKey> keys)
    {
        List<string> KeysToReplaced = [];

        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();

        var keysOnDB = new List<LocalizationKey>();
        var newKeys = new List<LocalizationKey>();

        for (int i = 0; i < keys.Count; i++)
        {
            var key = await _cMongoClient
                .GetCollection<LocalizationKey>()
                .Aggregate()
                .Match(e => e.Category == keys[i].Category && e.Name == keys[i].Name)
                .FirstOrDefaultAsync();

            if (key == null)
            {
                newKeys.Add(keys[i]);
                continue;
            }

            keysOnDB.Add(key);
        }

        var updates = new List<WriteModel<LocalizationKey>>();

        foreach (var k in keys)
        {
            var kToUpdate = UpdateKey(k, keysOnDB);
            if (kToUpdate == null) continue;
            KeysToReplaced.Add($"Category: {kToUpdate.Category} | Key: {kToUpdate.Name}");

            var filterBuilder = Builders<LocalizationKey>.Filter.Where(e => e.Id == kToUpdate.Id);
            updates.Add(new ReplaceOneModel<LocalizationKey>(filterBuilder, kToUpdate));
        }

        if (newKeys.Count > 0)
            await _cMongoClient.Create<LocalizationKey>(session, newKeys);

        if (updates.Count > 0)
            await _cMongoClient
                .GetCollection<LocalizationKey>()
                .BulkWriteAsync(updates, new BulkWriteOptions() { IsOrdered = false });

        await session.CommitTransactionAsync();

        return Ok(KeysToReplaced);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult> PostBulk(List<LocalizationKey> keys)
    {
        List<string> KeysToReplaced = [];
        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();
        await _cMongoClient.Create<LocalizationKey>(session, keys);
        await session.CommitTransactionAsync();

        return Ok(KeysToReplaced);
    }

    [HttpPut]
    public async Task<ActionResult> Put([FromHeader] string language, [FromBody] LocalizationKey key)
    {
        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();

        var category = await _cMongoClient
            .GetCollection<LocalizationCategory>()
            .Find(e => e.Name == key.Category)
            .FirstOrDefaultAsync();

        var oldKey = await _cMongoClient
            .GetCollection<LocalizationKey>()
            .Find(e => e.Name == key.Name)
            .FirstOrDefaultAsync();

        if (oldKey.Translated != key.Translated)
        {
            category.KeysTranslated[language] += key.Translated[language] ? 1 : -1;
        }

        var updateKeyTranslated = Builders<LocalizationCategory>.Update.Set(e => e.KeysTranslated, category.KeysTranslated);
        var updateTranslations = Builders<LocalizationKey>.Update.Set(e => e.Translations, key.Translations);
        var updateTranslated = Builders<LocalizationKey>.Update.Set(e => e.Translated, key.Translated);

        await _cMongoClient.Update(session, e => e.Name == key.Category, updateKeyTranslated);
        await _cMongoClient.Update(session, e => e.Category == key.Category && e.Name == key.Name, updateTranslations);
        await _cMongoClient.Update(session, e => e.Category == key.Category && e.Name == key.Name, updateTranslated);

        await session.CommitTransactionAsync();

        return Ok(key);
    }

    private async Task<bool> VerifiedIfKeyExist(string category, string name)
    {
        var query = await _cMongoClient
            .GetCollection<LocalizationKey>()
            .FindAsync(e => e.Category == category && e.Name == name);

        var skip = await query.FirstOrDefaultAsync();

        return skip != null;
    }

    private static LocalizationKey? UpdateKey(LocalizationKey key, List<LocalizationKey> oldKeys)
    {
        LocalizationKey? OldKey = oldKeys.FirstOrDefault(e => e.Category == key.Category && e.Name == key.Name);

        if (OldKey == null) return null;

        var updated = false;

        foreach (var original in OldKey.Original)
        {
            if (original.Value != key.Original[original.Key])
            {
                OldKey.Original[original.Key] = key.Original[original.Key];
                key.Translated[original.Key] = false;
                updated = true;
            }
        }

        return updated ? OldKey : null;
    }

}