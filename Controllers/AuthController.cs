using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;

namespace SdoricaTranslatorTool.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        readonly ICustomMongoClient _cMongoClient;
        readonly IConfiguration _config;

        public AuthController(ICustomMongoClient cMongoClient, IConfiguration configuration)
        {
            _cMongoClient = cMongoClient;
            _config = configuration;
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] AuthValidation authValidation)
        {
            using (var session = await _cMongoClient.StartSessionAsync())
            {
                session.StartTransaction();

                try
                {
                    var validationSettings = new GoogleJsonWebSignature.ValidationSettings()
                    {
                        Audience = new List<string>() { _config["GoogleCliendId"] }
                    };
                    var payload = await GoogleJsonWebSignature.ValidateAsync(authValidation.IdToken, validationSettings);

                    var user = await _cMongoClient
                        .GetCollection<User>()
                        .Find(e => e.Email == payload.Email)
                        .FirstOrDefaultAsync();

                    if (user == null)
                    {
                        User newUser = new User
                        {
                            Email = payload.Email,
                            TranslationCount = 3,
                            Rol = "guest"
                        };

                        await _cMongoClient.Create<User>(session, newUser);
                        await session.CommitTransactionAsync();

                        user = newUser;
                    }

                    return Ok(user);
                }
                catch (Exception ex)
                {
                    await session.AbortTransactionAsync();
                    return Unauthorized();
                }
            }

        }

    }
}