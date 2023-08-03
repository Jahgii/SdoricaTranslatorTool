using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;

namespace SdoricaTranslatorTool.Controllers
{
    public class GroupsController : Controller
    {
        readonly ICustomMongoClient _cMongoClient;

        public GroupsController(ICustomMongoClient cMongoClient)
        {
            _cMongoClient = cMongoClient;
        }

        [HttpPost]
        public async Task<ActionResult> Post(List<Group> groups)
        {
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    foreach (var g in groups)
                    {
                        if (await VerifiedGroup(g.OriginalName)) continue;

                        await _cMongoClient.Create<Group>(session, g);
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

        private async Task<bool> VerifiedGroup(string group)
        {
            var filter = Builders<Group>.Filter.Eq(d => d.OriginalName, group);
            var query = await _cMongoClient.GetCollection<Group>().FindAsync<Group>(filter);
            var skip = await query.FirstOrDefaultAsync();

            return skip != null;
        }

    }
}
