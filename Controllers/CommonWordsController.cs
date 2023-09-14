using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace SdoricaTranslatorTool.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CommonWords : Controller
    {
        readonly ICustomMongoClient _cMongoClient;

        public CommonWords(ICustomMongoClient cMongoClient)
        {
            _cMongoClient = cMongoClient;
        }

        [HttpGet]
        public async Task<ActionResult> Get()
        {
            var cursor = await _cMongoClient.GetCollection<CommonWord>().FindAsync(_ => true);
            var data = await cursor.ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<ActionResult> Post(CommonWord word)
        {
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    await _cMongoClient.Create<CommonWord>(session, word);

                    await session.CommitTransactionAsync();
                }
                catch
                {
                    await session.AbortTransactionAsync();
                    return StatusCode(500);
                }
            }

            return Ok(word);
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] CommonWord word)
        {
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    await _cMongoClient.Replace<CommonWord>(session, e => e.Id == word.Id, word);

                    await session.CommitTransactionAsync();
                }
                catch
                {
                    await session.AbortTransactionAsync();
                    return StatusCode(500);
                }
            }


            return Ok(word);
        }

        [HttpDelete]
        public async Task<ActionResult> Delete([FromBody] CommonWord word)
        {
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    await _cMongoClient.Delete<CommonWord>(session, e => e.Id == word.Id);

                    await session.CommitTransactionAsync();
                }
                catch
                {
                    await session.AbortTransactionAsync();
                    return StatusCode(500);
                }
            }

            return Ok(word);
        }
    }
}