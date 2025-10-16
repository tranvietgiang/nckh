@component('mail::message')
    # Xin chào {{ $studentName }},

    Bạn nhận được một **thông báo mới từ giảng viên**.

    ---

    **👨‍🏫 Giảng viên:** {{ $teacherName }}
    **🏫 Lớp:** {{ $className }}

    ---

    ## 📢 {{ $title }}

    {!! nl2br(e($content)) !!}

    ---

    Cảm ơn bạn đã đọc thông báo.
    Trân trọng,
    **Phòng Đào tạo – TDC**
@endcomponent
