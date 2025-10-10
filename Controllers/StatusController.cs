using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SdoricaTranslatorTool.Entities;
using SdoricaTranslatorTool.Services;

namespace SdoricaTranslatorTool.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatusController(ICustomMongoClient cMongoClient) : ControllerBase
{
    readonly ICustomMongoClient _cMongoClient = cMongoClient;

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult> Get()
    {
        var status = new
        {
            Version = "1.0.0",
            Status = "Alive",
            Production = "Ready"
        };

        var users = await _cMongoClient
            .GetCollection<User>()
            .Aggregate()
            .Match(e => true)
            .ToListAsync();

        if (users.Count == 0) status = status with { Production = "Empty" };

        return Ok(status);
    }
}