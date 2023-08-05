using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;

namespace SdoricaTranslatorTool.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GroupsController : Controller
    {
        readonly ICustomMongoClient _cMongoClient;

        public GroupsController(ICustomMongoClient cMongoClient)
        {
            _cMongoClient = cMongoClient;
        }

        [HttpGet]
        public async Task<ActionResult> Get([FromHeader]string? id)
        {
            var cursor = await _cMongoClient.GetCollection<Group>().FindAsync(_ => true);
            var data = await cursor.ToListAsync();
            return Ok(data);
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
                        if (await VerifiedGroup(g.OriginalName, g.Language)) continue;

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

        private async Task<bool> VerifiedGroup(string group, string language)
        {
            var query = await _cMongoClient.GetCollection<Group>().FindAsync<Group>(e => e.OriginalName == group && e.Language == language);
            var skip = await query.FirstOrDefaultAsync();

            return skip != null;
        }

    }
}
