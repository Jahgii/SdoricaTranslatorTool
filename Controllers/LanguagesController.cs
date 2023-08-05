using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;

namespace SdoricaTranslatorTool.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LanguagesController : Controller
    {
        readonly ICustomMongoClient _cMongoClient;

        public LanguagesController(ICustomMongoClient cMongoClient)
        {
            _cMongoClient = cMongoClient;
        }

        [HttpGet]
        public async Task<ActionResult> Get([FromHeader]string? id)
        {
            var cursor = await _cMongoClient.GetCollection<Languages>().FindAsync(_ => true);
            var data = await cursor.ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<ActionResult> Post(List<Languages> languages)
        {
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    foreach (var l in languages)
                    {
                        if (await VerifiedLanguage(l.Name)) continue;

                        await _cMongoClient.Create<Languages>(session, l);
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

        private async Task<bool> VerifiedLanguage(string language)
        {
            var query = await _cMongoClient.GetCollection<Languages>().FindAsync<Languages>(e => e.Name == language);
            var skip = await query.FirstOrDefaultAsync();

            return skip != null;
        }

    }
}
