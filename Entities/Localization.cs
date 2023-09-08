using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace SdoricaTranslatorTool.Entities
{
    public class LocalizationCategory
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public required string Name { get; set; }
        public required Dictionary<string, int> Keys { get; set; }
        public required Dictionary<string, int> KeysTranslated { get; set; }
    }

    public class LocalizationKey
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public required string Category { get; set; }
        public required string Name { get; set; }
        public bool? Custom { get; set; }
        public required Dictionary<string, bool> Translated { get; set; }
        public required Dictionary<string, string> Original { get; set; }
        public required Dictionary<string, string> Translations { get; set; }
    }
}
