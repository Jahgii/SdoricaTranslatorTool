using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace SdoricaTranslatorTool.Entities;

public class Languages
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public required string Name { get; set; }
}
