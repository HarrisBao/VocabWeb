namespace VocabWeb.Api.Models.ActivityEngine;

public enum AudioBehavior
{
    /// <summary>
    /// Không có âm thanh (hoặc không bắt buộc).
    /// </summary>
    NO_AUDIO,

    /// <summary>
    /// Tự động phát âm thanh khi bắt đầu câu hỏi (vd: Listen to Word).
    /// </summary>
    AUTO_PLAY_TARGET,

    /// <summary>
    /// Hiển thị nút loa để phát lại âm thanh.
    /// </summary>
    REPLAY_TARGET
}
