using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;
using SdoricaTranslatorTool.Services;

namespace SdoricaTranslatorTool.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(ICustomMongoClient cMongoClient, IJwt jwt) : ControllerBase
{
    readonly ICustomMongoClient _cMongoClient = cMongoClient;
    readonly IJwt _jwt = jwt;

    [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult> Post([FromBody] AuthValidation authValidation)
    {
        using var session = await _cMongoClient.StartSessionAsync();
        session.StartTransaction();

        var user = await _cMongoClient
            .GetCollection<User>()
            .Find(e =>
                e.Email == authValidation.User &&
                e.Password == authValidation.Password
            )
            .FirstOrDefaultAsync();

        if (user == null) return Unauthorized();

        if (user.Rol == "guest") user.Token = _jwt.GenerateToken(0.12);
        else if (user.Rol == "admin") user.Token = _jwt.GenerateToken(12);
        else return Unauthorized();

        return Ok(user);
    }
}