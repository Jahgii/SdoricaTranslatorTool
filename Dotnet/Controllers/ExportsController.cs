using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;
using SdoricaTranslatorTool.Services;

namespace SdoricaTranslatorTool.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExportsController(ICustomMongoClient cMongoClient) : ControllerBase
{
    readonly ICustomMongoClient _cMongoClient = cMongoClient;

    /// <summary>
    /// Get the general percentages on especified Language
    /// Not working on lang that are different on Dialog and Keys
    /// such as Chinese and Traditional Chinese.
    /// </summary>
    /// <param name="lang"></param>
    /// <returns></returns>
    [HttpGet("Percentages")]
    public async Task<ActionResult> GetPercentages([FromHeader] string lang)
    {
        int keysTranslated = (int)await _cMongoClient
            .GetCollection<LocalizationKey>()
            .Find(e => e.Translated[lang])
            .CountDocumentsAsync();

        int totalKeys = (int)await _cMongoClient
            .GetCollection<LocalizationKey>()
            .Find(_ => true)
            .CountDocumentsAsync();

        double keysPercentage = (double)keysTranslated * 100 / totalKeys;

        int dialogsTranslated = (int)await _cMongoClient
            .GetCollection<DialogAsset>()
            .Find(e => e.Language.Equals(lang, StringComparison.CurrentCultureIgnoreCase) && e.Translated)
            .CountDocumentsAsync();

        int totalDialogs = (int)await _cMongoClient
            .GetCollection<DialogAsset>()
            .Find(e => e.Language.Equals(lang, StringComparison.CurrentCultureIgnoreCase))
            .CountDocumentsAsync();

        double dialogsPercentage = (double)dialogsTranslated * 100 / totalDialogs;

        return Ok(new { Dialogs = dialogsPercentage, Keys = keysPercentage });
    }
}