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
        public bool Translated {  get; set; }
        public DialogAssetModel? Model { get; set; }
        public DialogAssetArray? ReferenceAavatarImage { get; set; }
        public DialogAssetArray? ReferenceDialogAudio { get; set; }
        public DialogAssetArray? _objectReferences { get; set; }
        public DialogAssetArray? _serializedStateKeys { get; set; }
        public DialogAssetArray? _serializedStateValues { get; set; }
    }

    public class DialogAssetModel
    {
        [BsonElement("$content")]
        [JsonPropertyName("$content")]
        public List<Dialog>? Content { get; set; }
    }

    public class DialogAssetArray
    {
        [BsonElement("$content")]
        [JsonPropertyName("$content")]
        public List<string>? Content { get; set; }
    }

    public class Dialog
    {
        public string? ID { get; set; }
        public string? SpeakerName { get; set; }
        public string? SpeakerAssetName { get; set; }
        public string? IconName { get; set; }
        public int IconLocate { get; set; }
        public string? OriginalText { get; set; }
        public string? Text { get; set; }
        public string? sfxName { get; set; }
        public double sfxVolume { get; set; }
    }

    public class DialogAssetModelExport
    {
        [BsonElement("$content")]
        [JsonPropertyName("$content")]
        public List<DialogExport>? Content { get; set; }
    }

    public class DialogExport : Dialog
    {
        public new string? Id { get; set; }
        public new string? SpeakerName { get; set; }
        public new string? SpeakerAssetName { get; set; }
        public new string? IconName { get; set; }
        public new int IconLocate { get; set; }
        public new string? Text { get; set; }
        public new string? sfxName { get; set; }
        public new decimal sfxVolume { get; set; }
    }
}