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
                        if (await VerifiedMainGroups(mG.OriginalName)) continue;

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

        private async Task<bool> VerifiedMainGroups(string mainGroup)
        {
            var filter = Builders<MainGroup>.Filter.Eq(d => d.OriginalName, mainGroup);
            var query = await _cMongoClient.GetCollection<MainGroup>().FindAsync<MainGroup>(filter);
            var skip = await query.FirstOrDefaultAsync();

            return skip != null;
        }
    }
}
