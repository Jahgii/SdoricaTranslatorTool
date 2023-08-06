using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace SdoricaTranslatorTool.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DialogAssetsController : Controller
    {
        readonly ICustomMongoClient _cMongoClient;

        public DialogAssetsController(ICustomMongoClient cMongoClient)
        {
            _cMongoClient = cMongoClient;
        }

        [HttpGet]
        public async Task<ActionResult> Get([FromHeader] string language, [FromHeader] string mainGroup, [FromHeader] string group)
        {
            var cursor = await _cMongoClient.GetCollection<DialogAsset>().FindAsync(e => e.Language == language && e.MainGroup == mainGroup && e.Group == group);
            var data = await cursor.ToListAsync();
            return Ok(data);
        }


        [HttpPost]
        public async Task<ActionResult> Post(List<DialogAsset> dialogAssets)
        {
            int FileSkip = 0;
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    FileSkip = await SkipAssets(dialogAssets);
                    if(dialogAssets.Count > 0)
                    {
                        await _cMongoClient.Create<DialogAsset>(session, dialogAssets);
                        await session.CommitTransactionAsync();
                    }
                }
                catch
                {
                    await session.AbortTransactionAsync();
                    return StatusCode(500);
                }
            }

            return Ok(new { FileSkip = FileSkip });
        }

        private async Task<int> SkipAssets(List<DialogAsset> dialogAssets)
        {
            var skip = 0;
            for (var index = dialogAssets.Count - 1; index >= 0; index--)
            {
                DialogAsset dialogAsset = dialogAssets[index];
                if (await SkipAsset(dialogAsset))
                {
                    dialogAssets.RemoveAt(index);
                    skip += 1;
                }
            }

            return skip;
        }

        private async Task<bool> SkipAsset(DialogAsset dialogAssets)
        {
            var filter = Builders<DialogAsset>.Filter.Eq(d => d.Filename, dialogAssets.Filename ?? "");
            var query = await _cMongoClient.GetCollection<DialogAsset>().FindAsync<DialogAsset>(filter);
            var skip = await query.FirstOrDefaultAsync();

            return skip != null;
        }
    }
}