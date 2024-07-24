using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;

namespace SdoricaTranslatorTool.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : Controller
    {
        readonly ICustomMongoClient _cMongoClient;

        public GroupsController(ICustomMongoClient cMongoClient)
        {
            _cMongoClient = cMongoClient;
        }

        [HttpGet]
        public async Task<ActionResult> Get([FromHeader] string language, [FromHeader] string mainGroup)
        {
            var cursor = _cMongoClient.GetCollection<Group>().Find(e => e.Language == language && e.MainGroup == mainGroup)
                .SortBy(e => e.Name);
            var data = await cursor.ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<ActionResult> Post(List<Group> groups)
        {
            using var session = await _cMongoClient.StartSessionAsync();
            session.StartTransaction();

            foreach (var g in groups)
            {
                if (await VerifiedGroup(g.OriginalName, g.Language)) continue;

                await _cMongoClient.Create(session, g);
            }

            await session.CommitTransactionAsync();

            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult> Put(Group group)
        {
            using var session = await _cMongoClient.StartSessionAsync();
            session.StartTransaction();

            var updateGroupName = Builders<Group>.Update.Set(e => e.Name, group.Name);
            var updateImageLink = Builders<Group>.Update.Set(e => e.ImageLink, group.ImageLink);

            await _cMongoClient.Update(session, e => e.Id == group.Id, updateGroupName);
            await _cMongoClient.Update(session, e => e.Id == group.Id, updateImageLink);

            await session.CommitTransactionAsync();

            return Ok(group);
        }

        private async Task<bool> VerifiedGroup(string group, string language)
        {
            var query = await _cMongoClient
                .GetCollection<Group>()
                .FindAsync(e => e.OriginalName == group && e.Language == language);
            
            var skip = await query.FirstOrDefaultAsync();

            return skip != null;
        }

    }
}
