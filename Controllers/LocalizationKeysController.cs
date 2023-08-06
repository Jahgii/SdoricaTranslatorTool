using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;

namespace SdoricaTranslatorTool.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LocalizationKeysController : Controller
    {
        readonly ICustomMongoClient _cMongoClient;

        public LocalizationKeysController(ICustomMongoClient cMongoClient)
        {
            _cMongoClient = cMongoClient;
        }

        [HttpGet]
        public async Task<ActionResult> Get([FromHeader] string category)
        {
            var cursor = await _cMongoClient.GetCollection<LocalizationKey>().FindAsync(e => e.Category == category);
            var data = await cursor.ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<ActionResult> Post(List<LocalizationKey> keys)
        {
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    foreach (var k in keys)
                    {
                        if (await VerifiedKey(k.Category, k.Name)) continue;

                        await _cMongoClient.Create<LocalizationKey>(session, k);
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

        [HttpPost("bulk")]
        public async Task<ActionResult> PostBulk(List<LocalizationKey> keys)
        {
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                var list = new List<WriteModel<LocalizationKey>>();

                try
                {
                    //var keyCollection = _cMongoClient.GetCollection<LocalizationKey>();
                    //list.AddRange(keys);
                    //var resultWrites = await keyCollection.BulkWriteAsync(list);

                    await _cMongoClient.Create<LocalizationKey>(session, keys);

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

        private async Task<bool> VerifiedKey(string category, string name)
        {
            var query = await _cMongoClient.GetCollection<LocalizationKey>().FindAsync<LocalizationKey>(e => e.Category == category && e.Name == name);
            var skip = await query.FirstOrDefaultAsync();

            return skip != null;
        }

    }
}
