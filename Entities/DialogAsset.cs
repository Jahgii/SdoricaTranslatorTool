using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SdoricaTranslatorTool
{
    public class DialogAsset
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public required string OriginalFilename { get; set; }
        public required string Filename { get; set; }
        public required string MainGroup { get; set; }
        public required string Group { get; set; }
        public int Number { get; set; }
        public required string Language { get; set; }
        public bool Translated { get; set; }
        public required DialogAssetModel Model { get; set; }
        public required DialogAssetArray ReferenceAavatarImage { get; set; }
        public required DialogAssetArray ReferenceDialogAudio { get; set; }
        public required DialogAssetArray _objectReferences { get; set; }
        public required DialogAssetArray _serializedStateKeys { get; set; }
        public required DialogAssetArray _serializedStateValues { get; set; }
    }

    public class DialogAssetModel
    {
        [BsonElement("$content")]
        [JsonPropertyName("$content")]
        public required List<Dialog> Content { get; set; }
    }

    public class DialogAssetArray
    {
        [BsonElement("$content")]
        [JsonPropertyName("$content")]
        public required List<string> Content { get; set; }
    }

    public class Dialog
    {
        public required string ID { get; set; }
        public required string SpeakerName { get; set; }
        public required string SpeakerAssetName { get; set; }
        public required string IconName { get; set; }
        public int IconLocate { get; set; }
        public required string OriginalText { get; set; }
        public required string Text { get; set; }
        public required string sfxName { get; set; }
        public double sfxVolume { get; set; }
    }
}