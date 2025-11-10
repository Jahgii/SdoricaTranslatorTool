using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;
using SdoricaTranslatorTool.Services;

namespace SdoricaTranslatorTool.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatusController(ICustomMongoClient cMongoClient, IJwt jwt) : ControllerBase
{
    readonly ICustomMongoClient _cMongoClient = cMongoClient;
    readonly IJwt _jwt = jwt;

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult> Get()
    {
        var status = new
        {
            version = "1.0.0",
            status = "Alive",
            production = "Ready",
            token = "",
        };

        var users = await _cMongoClient
            .GetCollection<User>()
            .Aggregate()
            .Match(e => true)
            .ToListAsync();

        if (users.Count == 0)
        {
            status = status with { token = _jwt.GenerateToken(0.12) };
            status = status with { production = "Empty" };
        }

        return Ok(status);
    }
}