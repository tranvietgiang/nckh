@component('mail::message')
    Thông báo từ giảng viên

    Xin chào {{ $studentName }},

    Bạn có thông báo mới từ giảng viên trong lớp học.

    ---

    Giảng viên: {{ $teacherName }}
    Lớp: {{ $className }}
    Tiêu đề: {{ $title }}

    ---

    Nội dung:
    {!! nl2br(e($content)) !!}

    ---

    Trân trọng,
    Phòng Đào tạo - TDC

    <small>Đây là email tự động, vui lòng không trả lời.</small>
@endcomponent
