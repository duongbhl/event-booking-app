from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


BASE = Path("/home/oizoiui/Documents/Mobile/event-booking-app/20225824_PhamHongDuong_20252/Hinhve")
FONT_PATH = "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf"
FONT_BOLD_PATH = "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf"


def get_font(size: int, bold: bool = False):
    path = FONT_BOLD_PATH if bold else FONT_PATH
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def draw_centered_text(draw, box, text, font, fill="black"):
    x1, y1, x2, y2 = box
    bbox = draw.multiline_textbbox((0, 0), text, font=font, spacing=4, align="center")
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = x1 + (x2 - x1 - w) / 2
    y = y1 + (y2 - y1 - h) / 2
    draw.multiline_text((x, y), text, font=font, fill=fill, spacing=4, align="center")


def draw_actor(draw, x, y, label):
    r = 18
    draw.ellipse((x - r, y - 55 - r, x + r, y - 55 + r), outline="black", width=2)
    draw.line((x, y - 37, x, y + 5), fill="black", width=2)
    draw.line((x - 25, y - 20, x + 25, y - 20), fill="black", width=2)
    draw.line((x, y + 5, x - 20, y + 35), fill="black", width=2)
    draw.line((x, y + 5, x + 20, y + 35), fill="black", width=2)
    font = get_font(20)
    bbox = draw.textbbox((0, 0), label, font=font)
    draw.text((x - (bbox[2] - bbox[0]) / 2, y + 45), label, font=font, fill="black")


def draw_usecase(draw, box, text):
    draw.ellipse(box, outline="black", width=2)
    draw_centered_text(draw, box, text, get_font(18))


def connect(draw, start, end):
    draw.line((start[0], start[1], end[0], end[1]), fill="black", width=2)


def create_usecase_overview():
    img = Image.new("RGB", (1800, 1200), "white")
    draw = ImageDraw.Draw(img)
    draw.rectangle((260, 70, 1540, 1110), outline="black", width=3)
    draw.text((760, 85), "Hệ thống event-booking-app", font=get_font(28, bold=True), fill="black")

    draw_actor(draw, 130, 260, "Người dùng")
    draw_actor(draw, 130, 680, "Người tổ chức")
    draw_actor(draw, 1660, 360, "Quản trị viên")

    usecases = {
        "Đăng ký /\nđăng nhập": (470, 150, 720, 240),
        "Tìm kiếm và\nlọc sự kiện": (470, 280, 720, 370),
        "Xem chi tiết\nsự kiện": (470, 410, 720, 500),
        "Lưu sự kiện\nquan tâm": (470, 540, 720, 630),
        "Đặt vé và xác nhận\nthanh toán": (470, 670, 760, 770),
        "Xem vé điện tử": (470, 810, 720, 900),
        "Nhắn tin /\nnhận thông báo": (470, 950, 760, 1040),
        "Tạo và quản lý\nsự kiện": (980, 240, 1240, 340),
        "Quản lý hạng vé": (980, 390, 1240, 480),
        "Mời người dùng\ntham gia": (980, 530, 1240, 620),
        "Check-in vé\nbằng QR": (980, 680, 1240, 770),
        "Duyệt /\n từ chối sự kiện": (980, 830, 1240, 920),
    }

    for text, box in usecases.items():
        draw_usecase(draw, box, text)

    # user connections
    for key in [
        "Đăng ký /\nđăng nhập",
        "Tìm kiếm và\nlọc sự kiện",
        "Xem chi tiết\nsự kiện",
        "Lưu sự kiện\nquan tâm",
        "Đặt vé và xác nhận\nthanh toán",
        "Xem vé điện tử",
        "Nhắn tin /\nnhận thông báo",
    ]:
        box = usecases[key]
        connect(draw, (180, 260 if box[1] < 500 else 300), (box[0], (box[1] + box[3]) / 2))

    # organizer connections
    for key in [
        "Tạo và quản lý\nsự kiện",
        "Quản lý hạng vé",
        "Mời người dùng\ntham gia",
        "Check-in vé\nbằng QR",
        "Nhắn tin /\nnhận thông báo",
    ]:
        box = usecases[key]
        connect(draw, (180, 680), (box[0], (box[1] + box[3]) / 2))

    # admin connections
    connect(draw, (1610, 360), (1240, 875))
    connect(draw, (1610, 360), (1240, 290))

    img.save(BASE / "UseCaseTongQuat.png")


def create_usecase_booking():
    img = Image.new("RGB", (1700, 1000), "white")
    draw = ImageDraw.Draw(img)
    draw.rectangle((230, 70, 1460, 930), outline="black", width=3)
    draw.text((620, 85), "Phân rã use case Đặt vé và tham dự sự kiện", font=get_font(28, bold=True), fill="black")

    draw_actor(draw, 120, 340, "Người dùng")
    draw_actor(draw, 120, 720, "Người tổ chức")

    usecases = {
        "Xem chi tiết\nsự kiện": (420, 150, 680, 240),
        "Chọn hạng vé\nvà số lượng": (420, 280, 720, 370),
        "Xác nhận thanh toán": (420, 410, 720, 500),
        "Nhận vé điện tử": (420, 540, 680, 630),
        "Xem mã QR": (420, 670, 640, 760),
        "Quét mã QR\ncheck-in": (930, 260, 1180, 350),
        "Xác thực vé": (930, 430, 1160, 520),
        "Ghi nhận tham dự": (930, 600, 1180, 690),
    }

    for text, box in usecases.items():
        draw_usecase(draw, box, text)

    # user
    for key in ["Xem chi tiết\nsự kiện", "Chọn hạng vé\nvà số lượng", "Xác nhận thanh toán", "Nhận vé điện tử", "Xem mã QR"]:
        box = usecases[key]
        connect(draw, (170, 340), (box[0], (box[1] + box[3]) / 2))

    # organizer
    for key in ["Quét mã QR\ncheck-in", "Xác thực vé", "Ghi nhận tham dự"]:
        box = usecases[key]
        connect(draw, (170, 720), (box[0], (box[1] + box[3]) / 2))

    # internal logical flow
    flow_pairs = [
        ("Xem chi tiết\nsự kiện", "Chọn hạng vé\nvà số lượng"),
        ("Chọn hạng vé\nvà số lượng", "Xác nhận thanh toán"),
        ("Xác nhận thanh toán", "Nhận vé điện tử"),
        ("Nhận vé điện tử", "Xem mã QR"),
        ("Xem mã QR", "Quét mã QR\ncheck-in"),
        ("Quét mã QR\ncheck-in", "Xác thực vé"),
        ("Xác thực vé", "Ghi nhận tham dự"),
    ]
    for a, b in flow_pairs:
        box_a = usecases[a]
        box_b = usecases[b]
        connect(draw, (box_a[2], (box_a[1] + box_a[3]) / 2), (box_b[0], (box_b[1] + box_b[3]) / 2))

    img.save(BASE / "UseCaseDatVe.png")


def draw_activity_box(draw, box, text, rounded=False):
    if rounded:
        draw.rounded_rectangle(box, radius=18, outline="black", width=2, fill="white")
    else:
        draw.rectangle(box, outline="black", width=2, fill="white")
    draw_centered_text(draw, box, text, get_font(18))


def create_activity_booking():
    img = Image.new("RGB", (1800, 1500), "white")
    draw = ImageDraw.Draw(img)
    draw.text((540, 40), "Biểu đồ hoạt động quy trình đặt vé và tham dự sự kiện", font=get_font(30, bold=True), fill="black")

    lanes = [("Người dùng", 80, 540), ("Hệ thống", 540, 1080), ("Người tổ chức", 1080, 1720)]
    for label, x1, x2 in lanes:
        draw.rectangle((x1, 100, x2, 1420), outline="black", width=2)
        draw.rectangle((x1, 100, x2, 155), outline="black", width=2, fill="#f2f2f2")
        draw_centered_text(draw, (x1, 100, x2, 155), label, get_font(20, bold=True))

    # start
    draw.ellipse((290, 180, 330, 220), fill="black", outline="black")

    steps = [
        ("Tìm và chọn sự kiện", (180, 250, 440, 320), "user"),
        ("Hiển thị chi tiết sự kiện\nvà các hạng vé", (640, 250, 960, 330), "sys"),
        ("Chọn hạng vé và số lượng", (180, 390, 440, 460), "user"),
        ("Kiểm tra quota và\nkhởi tạo vé tạm", (640, 390, 960, 470), "sys"),
        ("Xác nhận thanh toán", (180, 540, 440, 610), "user"),
        ("Ghi nhận thanh toán,\nsinh vé điện tử và mã QR", (620, 540, 980, 630), "sys"),
        ("Xem vé điện tử", (180, 700, 440, 770), "user"),
        ("Quét mã QR tại sự kiện", (1180, 700, 1460, 770), "org"),
        ("Xác thực vé và cập nhật\ntrạng thái check-in", (620, 860, 980, 950), "sys"),
        ("Hoàn tất tham dự", (1180, 1030, 1460, 1100), "org"),
    ]

    for text, box, _ in steps:
        draw_activity_box(draw, box, text, rounded=True)

    # decision diamond
    diamond = [(800, 1030), (860, 1090), (800, 1150), (740, 1090)]
    draw.polygon(diamond, outline="black", fill="white")
    draw_centered_text(draw, (740, 1030, 860, 1150), "Vé hợp lệ?", get_font(16))

    # end
    draw.ellipse((1280, 1230, 1330, 1280), outline="black", width=2)
    draw.ellipse((1292, 1242, 1318, 1268), fill="black", outline="black")

    def line(a, b):
        draw.line((a[0], a[1], b[0], b[1]), fill="black", width=2)

    def arrow(a, b):
        line(a, b)
        x2, y2 = b
        draw.polygon([(x2, y2), (x2 - 10, y2 - 5), (x2 - 10, y2 + 5)], fill="black")

    arrow((310, 220), (310, 250))
    arrow((440, 285), (640, 285))
    arrow((800, 330), (800, 390))
    arrow((640, 430), (440, 430))
    arrow((310, 460), (310, 540))
    arrow((440, 575), (620, 585))
    arrow((620, 630), (440, 735))
    arrow((440, 735), (1180, 735))
    arrow((1320, 770), (1320, 860))
    arrow((1180, 905), (860, 905))
    arrow((800, 950), (800, 1030))
    draw.text((880, 1060), "Có", font=get_font(18), fill="black")
    arrow((860, 1090), (1180, 1065))
    draw.text((650, 1060), "Không", font=get_font(18), fill="black")
    arrow((740, 1090), (440, 575))
    arrow((1460, 1065), (1460, 1100))
    arrow((1320, 1100), (1320, 1230))

    img.save(BASE / "QuyTrinhDatVe.png")


def main():
    BASE.mkdir(parents=True, exist_ok=True)
    create_usecase_overview()
    create_usecase_booking()
    create_activity_booking()


if __name__ == "__main__":
    main()
