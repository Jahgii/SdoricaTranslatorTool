
using System.Net;

namespace SdoricaTranslatorTool
{
    public class ApiKeyMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;
        public ApiKeyMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (string.IsNullOrWhiteSpace(context.Request.Headers["STT-Api-Key"]))
            {
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                return;
            }
            string? userApiKey = context.Request.Headers["STT-Api-Key"];
            if (!IsValidApiKey(userApiKey!))
            {
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
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
}