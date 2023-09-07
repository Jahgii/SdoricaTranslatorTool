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

        [HttpGet("search")]
        public async Task<ActionResult> Search([FromHeader] string language, [FromHeader] string text)
        {
            var cursor = await _cMongoClient.GetCollection<LocalizationKey>().FindAsync(e => e.Original[language].ToLower().Contains(text.ToLower()));
            var data = await cursor.ToListAsync();
            return Ok(data);
        }

        [HttpGet("searchkey")]
        public async Task<ActionResult> SearchByKey([FromHeader] string key)
        {
            var cursor = _cMongoClient.GetCollection<LocalizationKey>().Find(e => e.Name.ToLower().Contains(key.ToLower())).SortBy(e => e.Name);
            var data = await cursor.ToListAsync();
            return Ok(data);
        }


        [HttpGet("verified")]
        public async Task<ActionResult> Veried()
        {
            var data = await _cMongoClient.GetCollection<LocalizationKey>().Find(_ => true).FirstOrDefaultAsync();
            if (data == null) return Ok(new { Bulk = true });
            return Ok(new { Bulk = false });
        }

        [HttpGet("export")]
        public async Task<ActionResult> GetExport([FromHeader] string language)
        {
            var cursor = await _cMongoClient.GetCollection<LocalizationKey>().FindAsync(e => e.Translated[language] == true);
            var data = await cursor.ToListAsync();
            return Ok(data);
        }

        [HttpPost("import")]
        public async Task<ActionResult> Post(List<LocalizationKey> keys)
        {
            List<string> KeysToReplaced = new List<string>();
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    foreach (var k in keys)
                    {
                        if (await VerifiedIfKeyExist(k.Category, k.Name))
                        {
                            var kToReplace = await UpdateKey(k);
                            if (kToReplace == null) continue;
                            KeysToReplaced.Add($"Category: {kToReplace.Category} | Key: {kToReplace.Name}");
                            await _cMongoClient.Replace<LocalizationKey>(session, e => e.Id == kToReplace.Id, kToReplace);
                            continue;
                        };

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

            return Ok(KeysToReplaced);
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

        [HttpPut]
        public async Task<ActionResult> Put([FromHeader] string language, [FromBody] LocalizationKey key)
        {
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    var category = await _cMongoClient.GetCollection<LocalizationCategory>().Find(e => e.Name == key.Category).FirstOrDefaultAsync();
                    var oldKey = await _cMongoClient.GetCollection<LocalizationKey>().Find(e => e.Name == key.Name).FirstOrDefaultAsync();

                    if (oldKey.Translated != key.Translated)
                    {
                        category.KeysTranslated[language] += key.Translated[language] ? 1 : -1;
                    }

                    var updateKeyTranslated = Builders<LocalizationCategory>.Update.Set(e => e.KeysTranslated, category.KeysTranslated);
                    var updateTranslations = Builders<LocalizationKey>.Update.Set(e => e.Translations, key.Translations);
                    var updateTranslated = Builders<LocalizationKey>.Update.Set(e => e.Translated, key.Translated);

                    await _cMongoClient.Update<LocalizationCategory>(session, e => e.Name == key.Category, updateKeyTranslated);
                    await _cMongoClient.Update<LocalizationKey>(session, e => e.Category == key.Category && e.Name == key.Name, updateTranslations);
                    await _cMongoClient.Update<LocalizationKey>(session, e => e.Category == key.Category && e.Name == key.Name, updateTranslated);

                    await session.CommitTransactionAsync();
                }
                catch
                {
                    await session.AbortTransactionAsync();
                    return StatusCode(500);
                }
            }


            return Ok(key);
        }

        private async Task<bool> VerifiedIfKeyExist(string category, string name)
        {
            var query = await _cMongoClient.GetCollection<LocalizationKey>().FindAsync<LocalizationKey>(e => e.Category == category && e.Name == name);
            var skip = await query.FirstOrDefaultAsync();

            return skip != null;
        }

        private async Task<LocalizationKey?> UpdateKey(LocalizationKey key)
        {
            LocalizationKey OldKey = await _cMongoClient
                .GetCollection<LocalizationKey>()
                .Find(e => e.Category == key.Category && e.Name == key.Name)
                .FirstOrDefaultAsync();

            if (OldKey == null) return null;

            var updated = false;

            foreach (var original in OldKey.Original)
            {
                if (original.Value != key.Original[original.Key])
                {
                    OldKey.Original[original.Key] = key.Original[original.Key];
                    key.Translated[original.Key] = false;
                    updated = true;
                }
            }

            return updated ? OldKey : null;
        }

    }
}