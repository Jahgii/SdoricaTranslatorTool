using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;

namespace SdoricaTranslatorTool.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MainGroupsController : Controller
    {
        readonly ICustomMongoClient _cMongoClient;

        public MainGroupsController(ICustomMongoClient cMongoClient)
        {
            _cMongoClient = cMongoClient;
        }

        [HttpGet]
        public async Task<ActionResult> Get([FromHeader] string? id)
        {
            var cursor = await _cMongoClient.GetCollection<MainGroup>().FindAsync(_ => true);
            var data = await cursor.ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<ActionResult> Post(List<MainGroup> mainGroups)
        {
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    foreach (var mG in mainGroups)
                    {
                        if (await VerifiedMainGroups(mG.OriginalName, mG.Language)) continue;

                        await _cMongoClient.Create<MainGroup>(session, mG);
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

        private async Task<bool> VerifiedMainGroups(string mainGroup, string language)
        {
            var query = await _cMongoClient.GetCollection<MainGroup>().FindAsync<MainGroup>(e => e.OriginalName == mainGroup && e.Language == language);
            var skip = await query.FirstOrDefaultAsync();

            return skip != null;
        }
    }
}
