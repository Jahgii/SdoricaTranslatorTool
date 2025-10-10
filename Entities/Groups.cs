using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace SdoricaTranslatorTool.Entities;

public class MainGroup
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public required string Language { get; set; }
    public required string OriginalName { get; set; }
    public required string Name { get; set; }
    public string? ImageLink { get; set; }
    public int? Files { get; set; }
    public int? TranslatedFiles { get; set; }
    public int? Order { get; set; }
}

public class Group
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public required string Language { get; set; }
    public required string MainGroup { get; set; }
    public required string OriginalName { get; set; }
    public required string Name { get; set; }
    public string? ImageLink { get; set; }
    public int? Files { get; set; }
    public int? TranslatedFiles { get; set; }
    public int? Order { get; set; }
}
