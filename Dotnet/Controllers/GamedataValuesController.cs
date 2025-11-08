using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;
using SdoricaTranslatorTool.Services;

namespace SdoricaTranslatorTool.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamedataValues(ICustomMongoClient cMongoClient, IMemoryCache cache) : ControllerBase
{
    readonly ICustomMongoClient _cMongoClient = cMongoClient;
    readonly IMemoryCache _cache = cache;
    readonly string CacheKey = "Export_GameData";

    [HttpGet]
    public async Task<ActionResult> Get([FromHeader] string category)
    {
        var cursor = _cMongoClient
            .GetCollection<GamedataValue>()
            .Find(e => e.Category == category)
            .SortBy(e => e.Content.order);
        var data = await cursor.ToListAsync();
        return Ok(data);
    }

    [HttpGet("searchkeyequal")]
    public async Task<ActionResult> SearchByKeyEqual([FromHeader] string category, [FromHeader] string key)
    {
        var cursor = _cMongoClient.GetCollection<GamedataValue>()
            .Find(e => e.Category == category && e.Name == key);
        var data = await cursor.ToListAsync();
        return Ok(data);
    }

    [HttpGet("export")]
    public async Task<ActionResult> GetExport()
    {
        if (!_cache.TryGetValue(CacheKey, out List<GamedataValue>? data))
        {
            var cursor = await _cMongoClient.GetCollection<GamedataValue>()
                .FindAsync(e => e.Custom == true);
            data = await cursor.ToListAsync();

            _cache.Set(CacheKey, data, new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.MaxValue));
        }

        return Ok(data);
    }

    [HttpPost]
    public async Task<ActionResult> Post(GamedataValue value)
    {
        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();

        if (await VerifiedIfValueExist(value.Category, value.Name)) return Ok();

        await _cMongoClient.Create(session, value);

        await session.CommitTransactionAsync();

        _cache.Remove(CacheKey);

        return Ok(value);
    }

    [HttpPost("import")]
    public async Task<ActionResult> Post(List<GamedataValue> values)
    {
        List<string> KeysToReplaced = [];
        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();

        foreach (var v in values)
        {
            if (await VerifiedIfValueExist(v.Category, v.Name))
            {
                var vToReplace = await UpdateKey(v);
                if (vToReplace == null) continue;
                KeysToReplaced.Add($"Category: {vToReplace.Category} | Value: {vToReplace.Name}");
                await _cMongoClient.Replace(session, e => e.Id == vToReplace.Id, vToReplace);
                continue;
            }
            ;

            await _cMongoClient.Create(session, v);
        }

        await session.CommitTransactionAsync();

        _cache.Remove(CacheKey);

        return Ok(KeysToReplaced);
    }

    [HttpPut]
    public async Task<ActionResult> Put([FromBody] GamedataValue value)
    {
        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();

        await _cMongoClient.Replace(session, e => e.Id == value.Id, value);

        await session.CommitTransactionAsync();

        _cache.Remove(CacheKey);

        return Ok(value);
    }

    [HttpDelete]
    public async Task<ActionResult> Delete([FromBody] GamedataValue value)
    {
        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();

        await _cMongoClient.Delete<GamedataValue>(session, e => e.Id == value.Id);

        await session.CommitTransactionAsync();

        _cache.Remove(CacheKey);

        return Ok();
    }

    private async Task<bool> VerifiedIfValueExist(string category, string name)
    {
        var query = await _cMongoClient.GetCollection<GamedataValue>().FindAsync<GamedataValue>(e => e.Category == category && e.Name == name);
        var skip = await query.FirstOrDefaultAsync();

        return skip != null;
    }

    private async Task<GamedataValue?> UpdateKey(GamedataValue value)
    {
        GamedataValue OldKey = await _cMongoClient
            .GetCollection<GamedataValue>()
            .Find(e => e.Category == value.Category && e.Name == value.Name)
            .FirstOrDefaultAsync();

        if (OldKey == null) return null;

        var updated = false;

        foreach (PropertyInfo propertyInfo in OldKey.Content.GetType().GetProperties(BindingFlags.Public))
        {
            if (propertyInfo.GetValue(OldKey.Content) != propertyInfo.GetValue(value.Content))
            {
                propertyInfo.SetValue(OldKey.Content, propertyInfo.GetValue(value.Content));
                updated = true;
            }
        }

        return updated ? OldKey : null;
    }

}