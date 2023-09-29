using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
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

        [AllowAnonymous]
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

                    user.Token = GenerateToken();

                    return Ok(user);
                }
                catch (Exception ex)
                {
                    await session.AbortTransactionAsync();
                    return Unauthorized();
                }
            }

        }


        private string GenerateToken()
        {
            var sSK = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["IssuerSigningKey"] ?? ""));
            var sC = new SigningCredentials(sSK, SecurityAlgorithms.HmacSha256);
            var jwtST = new JwtSecurityToken(
                issuer: _config["Issuer"],
                audience: _config["Audience"],
                claims: new List<Claim>(),
                expires: DateTime.Now.AddHours(1),
                signingCredentials: sC
            );
            return new JwtSecurityTokenHandler().WriteToken(jwtST);
        }
    }
}