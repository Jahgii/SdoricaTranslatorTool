using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace SdoricaTranslatorTool.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DialogAssetController : Controller
    {
        ICustomMongoClient _cMongoClient;

        public DialogAssetController(ICustomMongoClient cMongoClient)
        {
            _cMongoClient = cMongoClient;
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
                    await _cMongoClient.Create<DialogAsset>(session, dialogAssets);
                    await session.CommitTransactionAsync();
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
            var filter = Builders<DialogAsset>.Filter.Eq<string>("FileName", dialogAssets.Filename ?? "");
            var query = await _cMongoClient.GetCollection<DialogAsset>().FindAsync<DialogAsset>(filter);
            var skip = await query.FirstOrDefaultAsync();
0
            return (skip == null ? false : true);
        }
    }
}