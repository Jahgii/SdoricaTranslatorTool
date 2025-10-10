using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace SdoricaTranslatorTool.Entities;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required int TranslationCount { get; set; }
    public required string Rol { get; set; }
    [BsonIgnore]
    public string? Token { get; set; }
}

public class AuthValidation
{
    public required string User { get; set; }
    public required string Password { get; set; }
}
