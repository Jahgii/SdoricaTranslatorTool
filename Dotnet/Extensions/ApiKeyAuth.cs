
using System.Net;

namespace SdoricaTranslatorTool.Extensions;

public class ApiKeyMiddleware(RequestDelegate next, IConfiguration configuration)
{
    private readonly RequestDelegate _next = next;
    private readonly IConfiguration _configuration = configuration;

    public async Task InvokeAsync(HttpContext context)
    {
        if (string.IsNullOrWhiteSpace(context.Request.Headers["stt-api-key"]))
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            return;
        }
        string? userApiKey = context.Request.Headers["stt-api-key"];
        if (!IsValidApiKey(userApiKey!))
        {
            context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            await context.Response.WriteAsync("Api Key Invalid");

            return;
        }
        await _next(context);
    }

    private bool IsValidApiKey(string userApiKey)
    {
        if (string.IsNullOrWhiteSpace(userApiKey))
            return false;
        string? apiKey = _configuration.GetValue<string>("STT-Api-Key");
        if (apiKey == null || apiKey != userApiKey)
            return false;
        return true;
    }
}