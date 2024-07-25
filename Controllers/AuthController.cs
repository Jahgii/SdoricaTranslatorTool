using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
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
        readonly IJWT _jwt;

        public AuthController(ICustomMongoClient cMongoClient, IJWT jwt)
        {
            _cMongoClient = cMongoClient;
            _jwt = jwt;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult> Post([FromBody] AuthValidation authValidation, IConfiguration _config)
        {
            using var session = await _cMongoClient.StartSessionAsync();
            session.StartTransaction();

            try
            {
                var GoogleCliendId = _config["GoogleCliendId"];

                if (GoogleCliendId == null) return StatusCode(500);

                var validationSettings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = [GoogleCliendId]
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

                    int userCount = (int)await _cMongoClient
                    .GetCollection<User>()
                    .Find(_ => true)
                    .CountDocumentsAsync();

                    if (userCount == 0) newUser.Rol = "admin";

                    await _cMongoClient.Create<User>(session, newUser);
                    await session.CommitTransactionAsync();

                    user = newUser;
                }

                if (user.Rol == "guest")
                    user.Token = _jwt.GenerateToken(0.12);
                else if (user.Rol == "admin")
                    user.Token = _jwt.GenerateToken(12);
                else
                    return Unauthorized();

                return Ok(user);
            }
            catch
            {
                await session.AbortTransactionAsync();
                return Unauthorized();
            }

        }
    }
}