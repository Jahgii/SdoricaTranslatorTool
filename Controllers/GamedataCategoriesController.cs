using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;

namespace SdoricaTranslatorTool.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GamedataCategoriesController : Controller
    {
        readonly ICustomMongoClient _cMongoClient;

        public GamedataCategoriesController(ICustomMongoClient cMongoClient)
        {
            _cMongoClient = cMongoClient;
        }

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
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    foreach (var c in categories)
                    {
                        if (await VerifiedCategory(c.Name)) continue;

                        await _cMongoClient.Create<GamedataCategory>(session, c);
                    }

                    await session.CommitTransactionAsync();
                }
                catch
                {
                    await session.AbortTransactionAsync();
                    return StatusCode(500);
                }
            }


            return Ok();
        }
        private async Task<bool> VerifiedCategory(string name)
        {
            var query = await _cMongoClient.GetCollection<GamedataCategory>().FindAsync<GamedataCategory>(e => e.Name == name);
            var skip = await query.FirstOrDefaultAsync();

            return skip != null;
        }

    }
}
