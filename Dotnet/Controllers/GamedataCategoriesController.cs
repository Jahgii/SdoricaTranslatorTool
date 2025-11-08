using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;
using SdoricaTranslatorTool.Services;

namespace SdoricaTranslatorTool.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamedataCategoriesController(ICustomMongoClient cMongoClient) : ControllerBase
{
    readonly ICustomMongoClient _cMongoClient = cMongoClient;

    [HttpGet]
    public async Task<ActionResult> Get()
    {
        var cursor = _cMongoClient.GetCollection<GamedataCategory>().Find(_ => true)
            .SortBy(e => e.Name);
        var data = await cursor.ToListAsync();
        return Ok(data);
    }

    [HttpPost]
    public async Task<ActionResult> Post(List<GamedataCategory> categories)
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
    private async Task<bool> VerifiedCategory(string name)
    {
        var query = await _cMongoClient.GetCollection<GamedataCategory>().FindAsync<GamedataCategory>(e => e.Name == name);
        var skip = await query.FirstOrDefaultAsync();

        return skip != null;
    }

}
