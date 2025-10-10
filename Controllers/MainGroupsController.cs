using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;
using SdoricaTranslatorTool.Services;

namespace SdoricaTranslatorTool.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MainGroupsController(ICustomMongoClient cMongoClient) : Controller
{
    readonly ICustomMongoClient _cMongoClient = cMongoClient;

    [HttpGet]
    public async Task<ActionResult> Get([FromHeader] string language)
    {
        var cursor = _cMongoClient.GetCollection<MainGroup>().Find(e => e.Language == language)
            .SortBy(e => e.Name);
        var data = await cursor.ToListAsync();
        return Ok(data);
    }

    [HttpPost]
    public async Task<ActionResult> Post(List<MainGroup> mainGroups)
    {
        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();

        foreach (var mG in mainGroups)
        {
            if (await VerifiedMainGroups(mG.OriginalName, mG.Language)) continue;

            await _cMongoClient.Create(session, mG);
        }

        await session.CommitTransactionAsync();

        return Ok();
    }

    [HttpPut]
    public async Task<ActionResult> Put(MainGroup mainGroup)
    {
        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();

        var updateMainGroupName = Builders<MainGroup>.Update.Set(e => e.Name, mainGroup.Name);

        await _cMongoClient.Update(session, e => e.Id == mainGroup.Id, updateMainGroupName);

        await session.CommitTransactionAsync();

        return Ok(mainGroup);
    }

    private async Task<bool> VerifiedMainGroups(string mainGroup, string language)
    {
        var query = await _cMongoClient
            .GetCollection<MainGroup>()
            .FindAsync(e => e.OriginalName == mainGroup && e.Language == language);

        var skip = await query.FirstOrDefaultAsync();

        return skip != null;
    }
}
