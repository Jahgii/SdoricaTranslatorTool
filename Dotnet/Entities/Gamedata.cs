using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace SdoricaTranslatorTool.Entities;

public class GamedataCategory
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public required string Name { get; set; }
    public required Dictionary<string, int> Keys { get; set; }
}

public class GamedataValue
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public required string Category { get; set; }
    public required string Name { get; set; }
    public bool? Custom { get; set; }
    public required GamedataContent Content { get; set; }
}

public class GamedataContent
{
    public required string id { get; set; }
    public required string iconKey { get; set; }
    public required string localizationInfoKey { get; set; }
    public required string localizationNameKey { get; set; }
    public required int order { get; set; }
    public required bool viewable { get; set; }
}
