using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;

namespace SdoricaTranslatorTool.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GamedataValues : Controller
    {
        readonly ICustomMongoClient _cMongoClient;

        public GamedataValues(ICustomMongoClient cMongoClient)
        {
            _cMongoClient = cMongoClient;
        }

        [HttpGet]
        public async Task<ActionResult> Get([FromHeader] string category)
        {
            var cursor = await _cMongoClient.GetCollection<GamedataValue>().FindAsync(e => e.Category == category);
            var data = await cursor.ToListAsync();
            return Ok(data);
        }

        [HttpGet("searchkeyequal")]
        public async Task<ActionResult> SearchByKeyEqual([FromHeader] string category, [FromHeader] string key)
        {
            var cursor = _cMongoClient.GetCollection<GamedataValue>()
                .Find(e => e.Category == category && e.Name == key);
            var data = await cursor.ToListAsync();
            return Ok(data);
        }

        [HttpGet("export")]
        public async Task<ActionResult> GetExport()
        {
            var cursor = await _cMongoClient.GetCollection<GamedataValue>().FindAsync(e => e.Custom == true);
            var data = await cursor.ToListAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<ActionResult> Post(GamedataValue value)
        {
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    if (await VerifiedIfValueExist(value.Category, value.Name)) return Ok();

                    await _cMongoClient.Create<GamedataValue>(session, value);

                    await session.CommitTransactionAsync();
                }
                catch
                {
                    await session.AbortTransactionAsync();
                    return StatusCode(500);
                }
            }

            return Ok(value);
        }

        [HttpPost("import")]
        public async Task<ActionResult> Post(List<GamedataValue> values)
        {
            List<string> KeysToReplaced = new List<string>();
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    foreach (var v in values)
                    {
                        if (await VerifiedIfValueExist(v.Category, v.Name))
                        {
                            var vToReplace = await UpdateKey(v);
                            if (vToReplace == null) continue;
                            KeysToReplaced.Add($"Category: {vToReplace.Category} | Value: {vToReplace.Name}");
                            await _cMongoClient.Replace<GamedataValue>(session, e => e.Id == vToReplace.Id, vToReplace);
                            continue;
                        };

                        await _cMongoClient.Create<GamedataValue>(session, v);
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

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] GamedataValue value)
        {
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    await _cMongoClient.Replace<GamedataValue>(session, e => e.Id == value.Id, value);

                    await session.CommitTransactionAsync();
                }
                catch
                {
                    await session.AbortTransactionAsync();
                    return StatusCode(500);
                }
            }


            return Ok(value);
        }

        private async Task<bool> VerifiedIfValueExist(string category, string name)
        {
            var query = await _cMongoClient.GetCollection<GamedataValue>().FindAsync<GamedataValue>(e => e.Category == category && e.Name == name);
            var skip = await query.FirstOrDefaultAsync();

            return skip != null;
        }

        private async Task<GamedataValue?> UpdateKey(GamedataValue value)
        {
            GamedataValue OldKey = await _cMongoClient
                .GetCollection<GamedataValue>()
                .Find(e => e.Category == value.Category && e.Name == value.Name)
                .FirstOrDefaultAsync();

            if (OldKey == null) return null;

            var updated = false;

            foreach (PropertyInfo propertyInfo in OldKey.Content.GetType().GetProperties(BindingFlags.Public))
            {
                if (propertyInfo.GetValue(OldKey.Content) != propertyInfo.GetValue(value.Content))
                {
                    propertyInfo.SetValue(OldKey.Content, propertyInfo.GetValue(value.Content));
                    updated = true;
                }
            }

            return updated ? OldKey : null;
        }

    }
}