namespace VocabWeb.Api.Models.ActivityEngine;

public enum ActivityType
{
    /// <summary>
    /// Hiển thị từ, chọn nghĩa.
    /// </summary>
    WORD_TO_MEANING,

    /// <summary>
    /// Hiển thị nghĩa, chọn từ.
    /// </summary>
    MEANING_TO_WORD,

    /// <summary>
    /// Nghe âm thanh, chọn từ.
    /// </summary>
    LISTEN_TO_WORD,

    /// <summary>
    /// Nghe âm thanh, chọn nghĩa.
    /// </summary>
    LISTEN_TO_MEANING,

    /// <summary>
    /// Hiển thị nghĩa, gõ lại từ.
    /// </summary>
    MEANING_TO_TYPE_WORD,

    /// <summary>
    /// Nghe âm thanh, gõ lại từ.
    /// </summary>
    LISTEN_TO_TYPE_WORD,

    /// <summary>
    /// Hiển thị từ, gõ lại nghĩa.
    /// </summary>
    WORD_TO_TYPE_MEANING,

    /// <summary>
    /// Điền chữ cái còn thiếu của từ (vd: a__le).
    /// </summary>
    MISSING_LETTERS,

    /// <summary>
    /// Sắp xếp lại các chữ cái bị xáo trộn.
    /// </summary>
    UNSCRAMBLE_WORD,

    /// <summary>
    /// Ghép nối từ với nghĩa.
    /// </summary>
    MATCH_WORD_MEANING,

    /// <summary>
    /// Luyện phát âm (ghi âm và so khớp).
    /// </summary>
    PRONUNCIATION
}
