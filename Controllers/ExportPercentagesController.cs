using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;

namespace SdoricaTranslatorTool.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExportPercentagesController : Controller
    {
        readonly ICustomMongoClient _cMongoClient;

        public ExportPercentagesController(ICustomMongoClient cMongoClient)
        {
            _cMongoClient = cMongoClient;
        }

        /// <summary>
        /// Get the general percentages on especified Language
        /// Not working on lang that are different on Dialog and Keys
        /// such as Chinese and Traditional Chinese.
        /// </summary>
        /// <param name="lang"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> Get([FromHeader] string lang)
        {
            int keysTranslated = (int)await _cMongoClient
                .GetCollection<LocalizationKey>()
                .Find(e => e.Translated[lang])
                .CountDocumentsAsync();

            int totalKeys = (int)await _cMongoClient
                .GetCollection<LocalizationKey>()
                .Find(_ => true)
                .CountDocumentsAsync();

            double keysPercentage = keysTranslated * 100 / totalKeys;

            int dialogsTranslated = (int)await _cMongoClient
                .GetCollection<DialogAsset>()
                .Find(e => e.Language.ToLower() == lang.ToLower() && e.Translated == true)
                .CountDocumentsAsync();

            int totalDialogs = (int)await _cMongoClient
                .GetCollection<DialogAsset>()
                .Find(e => e.Language.ToLower() == lang.ToLower())
                .CountDocumentsAsync();

            double dialogsPercentage = dialogsTranslated * 100 / totalDialogs;

            return Ok(new { Dialogs = dialogsPercentage, Keys = keysPercentage });
        }
    }
}