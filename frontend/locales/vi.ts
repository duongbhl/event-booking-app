import { createEvent } from "../services/event.service";

export const vi = {
  // Common
  common: {
    search: 'Tìm kiếm',
    filter: 'Bộ lọc',
    save: 'Lưu',
    cancel: 'Hủy',
    delete: 'Xóa',
    edit: 'Chỉnh sửa',
    back: 'Quay lại',
    next: 'Tiếp theo',
    loading: 'Đang tải...',
    error: 'Lỗi',
    success: 'Thành công',
    confirmation: 'Xác nhận',
    areYouSure: 'Bạn có chắc không?',
    hello: 'Xin chào',
  },

  // Auth
  auth: {
    signIn: 'Đăng nhập',
    signUp: 'Đăng ký',
    email: 'Email',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
    name: 'Họ và tên',
    forgotPassword: 'Quên mật khẩu?',
    resetPassword: 'Đặt lại mật khẩu',
    verification: 'Xác minh',
    enterVerificationCode: 'Nhập mã xác minh',
    resendCode: 'Gửi lại mã',
    signOut: 'Đăng xuất',
    dontHaveAccount: 'Chưa có tài khoản?',
    alreadyHaveAccount: 'Đã có tài khoản?',
    giveCredential: 'Nhập thông tin để đăng nhập vào tài khoản của bạn',
    typeYourEmail: 'Nhập email của bạn',
    typeYourPassword: 'Nhập mật khẩu của bạn',
    rememberMe: 'Ghi nhớ tôi',
    createAccountSubtitle: 'Tạo tài khoản và tận hưởng tất cả các dịch vụ',
    typeYourFullName: 'Nhập họ và tên của bạn',
    confirmYourPassword: 'Xác nhận mật khẩu của bạn',
    orContinueWith: 'hoặc tiếp tục với',
    verificationSubtitle: 'Chúng tôi đã gửi mã xác minh đến',
    continue: 'TIẾP TỤC',
    resendCodeIn: 'Gửi lại mã trong',
    resetPasswordSubtitle: 'Vui lòng nhập địa chỉ email của bạn để yêu cầu đặt lại mật khẩu',
    newPassword: 'Mật khẩu mới',
    confirmNewPassword: 'Xác nhận mật khẩu mới',
    send: 'GỬI',
    loading: 'ĐANG TẢI...',
  },

  // Home
  home: {
    home: 'Trang chủ',
    upcomingEvents: 'Sự kiện sắp tới',
    viewAll: 'Xem tất cả',
    myEvents: 'Sự kiện của tôi',
    noEvents: 'Không tìm thấy sự kiện',
    startConversation: 'Bắt đầu cuộc trò chuyện!',
    chooseByCategory: 'Chọn theo danh mục',
    findAmazingEvents: 'Tìm những sự kiện tuyệt vời',
    noEventsInCategory: 'Không có sự kiện nào trong danh mục này',
  },

  // Events
  events: {
    events: 'Sự kiện',
    createEvent: 'Tạo sự kiện',
    editEvent: 'Chỉnh sửa sự kiện',
    eventDetails: 'Chi tiết sự kiện',
    title: 'Tiêu đề',
    description: 'Mô tả',
    category: 'Danh mục',
    price: 'Giá',
    date: 'Ngày',
    time: 'Giờ',
    location: 'Địa điểm',
    organizer: 'Người tổ chức',
    members: 'Thành viên',
    myEvent: 'Sự kiện của tôi',
    addEvent: 'Thêm sự kiện',
    eventDeleted: 'Xóa sự kiện thành công',
    eventCreated: 'Tạo sự kiện thành công',
    eventUpdated: 'Cập nhật sự kiện thành công',
  },

  // Search & Filter
  search: {
    search: 'Tìm kiếm',
    findAmazingEvents: 'Tìm những sự kiện tuyệt vời',
    noUsersFound: 'Không tìm thấy người dùng',
    searchUsers: 'Tìm kiếm người dùng...',
    searchForEvents: 'Tìm kiếm sự kiện...',
  },

  // Chat
  chat: {
    messages: 'Tin nhắn',
    message: 'Tin nhắn',
    chat: 'Trò chuyện',
    writeAReply: 'Viết phản hồi...',
    sendMessage: 'Gửi tin nhắn',
    noMessages: 'Chưa có tin nhắn',
    newMessage: 'Tin nhắn mới',
    onlineNow: 'Đang hoạt động',
  },

  // Notifications
  notifications: {
    notifications: 'Thông báo',
    noNotifications: 'Không có thông báo nào',
    markAsRead: 'Đánh dấu là đã đọc',
    paymentSuccessful: 'Thanh toán thành công',
    newInvitation: 'Lời mời mới',
    eventReminder: 'Nhắc nhở sự kiện',
    newMessage: 'Tin nhắn mới',
  },

  // Profile
  profile: {
    profile: 'Hồ sơ',
    editProfile: 'Chỉnh sửa hồ sơ',
    myProfile: 'Hồ sơ của tôi',
    followersCount: 'Người theo dõi',
    followingCount: 'Đang theo dõi',
    eventsCount: 'Sự kiện',
    aboutMe: 'Về tôi',
    country: 'Quốc gia',
    interests: 'Sở thích',
    description: 'Mô tả',
    noDescriptionYet: 'Chưa có mô tả',
    addCountry: 'Thêm quốc gia',
    profileUpdated: 'Cập nhật hồ sơ thành công',
    uploadAvatar: 'Tải lên ảnh đại diện',
  },

  // Settings
  settings: {
    settings: 'Cài đặt',
    language: 'Ngôn ngữ',
    english: 'English',
    vietnamese: 'Tiếng Việt',
    notifications: 'Thông báo',
    enableNotifications: 'Bật thông báo',
    privacy: 'Riêng tư',
    about: 'Về ứng dụng',
    logout: 'Đăng xuất',
    logoutConfirm: 'Bạn có chắc muốn đăng xuất không?',
  },

  // Booking & Payment
  booking: {
    tickets: 'Vé',
    buyTickets: 'Mua vé',
    bookTicket: 'Đặt vé',
    quantity: 'Số lượng',
    totalPrice: 'Tổng giá',
    selectTicketType: 'Chọn loại vé',
    purchaseConfirmed: 'Xác nhận mua hàng',
    paymentMethod: 'Phương thức thanh toán',
    creditCard: 'Thẻ tín dụng',
    wallet: 'Ví',
    paypal: 'PayPal',
    checkout: 'Thanh toán',
    addNewCard: 'Thêm thẻ mới',
    cardNumber: 'Số thẻ',
    expMonth: 'Tháng hết hạn',
    expYear: 'Năm hết hạn',
    saveAsPrimaryCard: 'Lưu làm thẻ chính',
    addCard: 'THÊM THẺ',
    scanCard: 'Quét thẻ',
    pleaseHoldCard: 'Vui lòng giữ thẻ của bạn bên trong khung',
    scanning: 'ĐANG QUÉT...',
    cardAddedSuccess: 'Thẻ được thêm thành công',
    failedAddCard: 'Không thể thêm thẻ',
  },

  // Invitations
  invitations: {
    inviteFriend: 'Mời bạn',
    sendInvitation: 'Gửi lời mời',
    invitationSent: 'Gửi lời mời thành công',
    selectAtLeastOne: 'Vui lòng chọn ít nhất một người dùng',
  },

  // Errors & Validation
  errors: {
    required: 'Trường này bắt buộc',
    invalidEmail: 'Địa chỉ email không hợp lệ',
    passwordTooShort: 'Mật khẩu phải có ít nhất 6 ký tự',
    passwordMismatch: 'Mật khẩu không khớp',
    networkError: 'Lỗi mạng. Vui lòng thử lại',
    serverError: 'Lỗi máy chủ. Vui lòng thử lại sau',
    notFound: 'Không tìm thấy',
    unauthorized: 'Không được phép',
    forbidden: 'Bị cấm',
  },

  // Time & Date
  time: {
    today: 'Hôm nay',
    tomorrow: 'Ngày mai',
    thisWeek: 'Tuần này',
    thisMonth: 'Tháng này',
    just_now: 'Vừa xong',
    minute_ago: 'Một phút trước',
    minutes_ago: ' phút trước',
    hour_ago: 'Một giờ trước',
    hours_ago: ' giờ trước',
    day_ago: 'Một ngày trước',
    days_ago: ' ngày trước',
  },

  // Calendar
  calendar: {
    title: 'Lịch',
    filterEvents: 'Lọc sự kiện',
    noEventsAvailable: 'Không có sự kiện nào khả dụng',
    ticket: 'vé',
    tickets: 'vé',
    clear: 'Xóa',
    apply: 'Áp dụng',
  },

  // Location
  location: {
    event: 'Sự kiện',
    getDirections: 'Nhận chỉ dẫn',
    myLocation: 'Vị trí của tôi',
    distance: 'Khoảng cách',
    locationNotAvailable: 'Thông tin vị trí không khả dụng',
    couldNotOpenMaps: 'Không thể mở ứng dụng bản đồ',
  },

  // MyEvent - Add Event
  addEvent: {
    createEvent: 'Tạo sự kiện mới',
    editEvent: 'Chỉnh sửa sự kiện',
    events: 'Sự kiện',
    selectCategory: 'Chọn danh mục',
    cancel: 'Hủy',
    addCoverPhotos: 'Thêm ảnh bìa',
    eventName: 'Tên sự kiện',
    eventType: 'Loại sự kiện',
    selectDateTime: 'Chọn ngày & giờ',
    location: 'Địa điểm',
    eventDescription: 'Mô tả sự kiện',
    required: '*',
    typeEventName: 'Nhập tên sự kiện',
    typeDescription: 'Nhập mô tả sự kiện...',
    description: 'Mô tả sự kiện',
    enterEventLocation: 'Nhập địa điểm sự kiện',
    selectEventType: 'Chọn loại sự kiện',
    addCoverImage: 'Thêm ảnh bìa',
    publishNow: 'Đăng sự kiện',

  },

  // MyEvent - Bookmark
  bookmark: {
    myFavoriteEvents: 'Sự kiện yêu thích của tôi',
    exploreEvents: 'Khám phá sự kiện',
    removedFromFavorites: 'Đã xóa khỏi yêu thích',
    addedToFavorites: 'Đã thêm vào yêu thích',
  },

  // MyEvent - CheckIn
  checkIn: {
    cameraPermissionRequired: 'Cần quyền truy cập camera',
    cameraAccessDescription: 'Chúng tôi cần truy cập camera của bạn để quét mã QR vé',
    grantPermission: 'Cấp quyền',
    checkIn: 'Check-in',
    alignQRCode: 'Căn chỉnh mã QR trong khung',
    manualInput: 'Nhập thủ công',
    exit: 'Thoát',
    checkInSuccess: 'Check-in thành công',
    passenger: 'Hành khách',
    event: 'Sự kiện',
    ticketType: 'Loại vé',
    seat: 'Chỗ ngồi',
    noSeatAssignment: 'Chưa có ghế',
    restartingScanner: 'Đang khởi động lại máy quét...',
    alreadyChecked: 'Đã check-in',
    alreadyCheckedDesc: 'Vé này đã được check-in rồi',
    wrongEvent: 'Sự kiện sai',
    wrongEventDesc: 'Mã QR này không thuộc sự kiện này',
    error: 'Lỗi',
    tryAgain: 'Thử lại',
    processing: 'Đang xử lý...',
  },

  // Registration - SelectCountry
  selectCountry: {
    countrySelection: 'Chọn Quốc gia',
    findConversation: 'Tìm kiếm',
    retry: 'Thử lại',
    loadingCountries: 'Đang tải quốc gia...',
    failedLoadCountries: 'Không thể tải quốc gia. Vui lòng kiểm tra kết nối internet và thử lại.',
    invalidResponse: 'Định dạng phản hồi không hợp lệ. Vui lòng thử lại.',
    next: 'TIẾP THEO',
    add: 'THÊM',
  },

  // Registration - SelectLocation
  selectLocation: {
    searchNewAddress: 'Tìm kiếm địa chỉ mới...',
    next: 'TIẾP THEO',
    add: 'THÊM',
  },

  // Registration - SelectInterest
  selectInterest: {
    selectInterests: 'Chọn 3 sở thích của bạn',
    finish: 'HOÀN THÀNH',
  },

  // Profile - EditProfile
  editProfile: {
    editProfileTitle: 'Chỉnh sửa hồ sơ',
    fullName: 'Họ và tên',
    enterFullName: 'Nhập họ và tên của bạn',
    country: 'Quốc gia',
    tapSelectCountry: 'Nhấn để chọn quốc gia',
    description: 'Mô tả',
    tellAboutYourself: 'Hãy kể về bạn',
    selectInterests: 'Chọn sở thích',
    saveChanges: 'LƯU THAY ĐỔI',
  },

  // Profile - OrganizerProfile
  organizerProfile: {
    about: 'Về',
    events: 'Sự kiện',
    reviews: 'Đánh giá',
    followers: 'Người theo dõi',
    following: 'Đang theo dõi',
    noDescription: 'Không có mô tả',
    noEvents: 'Chưa có sự kiện',
    unknownOrganizer: 'Người tổ chức không xác định',
  },

  // Notification
  notification: {
    notification: 'Thông báo',
    noNotification: 'Không có thông báo',
    notificationEmpty: 'Bạn sẽ được thông báo về hoạt động trên các sự kiện mà bạn đang cộng tác.',
    invitations: 'Lời mời',
    unread: 'Chưa đọc',
    earlier: 'Trước đó',
  },

  // MyEvent - Events
  myEventList: {
    events: 'Sự kiện',
    upcoming: 'SẮP TỚI',
    pastEvents: 'SỰ KIỆN QUA',
  },

  // MyEvent - AddEvent
  addEventPage: {
    createNewEvent: 'Tạo sự kiện mới',
    editEvent: 'Chỉnh sửa sự kiện',
    selectCategory: 'Chọn danh mục',
    cancel: 'Hủy',
    addCoverPhotos: 'Thêm ảnh bìa',
    eventName: 'Tên sự kiện',
    typeEventName: 'Nhập tên sự kiện',
    eventType: 'Loại sự kiện',
    chooseEventType: 'Chọn loại sự kiện',
    selectDateTime: 'Chọn ngày & giờ',
    location: 'Địa điểm',
    enterEventLocation: 'Nhập địa điểm sự kiện',
    eventDescription: 'Mô tả sự kiện',
    typeEventDescription: 'Nhập mô tả sự kiện...',
    updateEvent: 'CẬP NHẬT SỰ KIỆN',
    publishNow: 'XUẤT BẢN NGAY',
    required: '*',
  },

  // MyEvent - EventsPass
  eventsPast: {
    noPassEvent: 'Không có sự kiện quá khứ',
    noPassEventDesc: 'Bạn hiện không có sự kiện quá khứ.',
  },

  // MyEvent - EventDetails
  eventDetails: {
    booked: 'ĐÃ ĐẶT',
    membersJoined: 'Thành viên đã tham gia',
    invite: 'MỜI',
    eventEnded: 'SỰ KIỆN ĐÃ KẾT THÚC',
    eventOrganiser: 'Người tổ chức sự kiện',
    aboutSection: 'Về',
    descriptionSection: 'Mô tả',
    ticketTiers: 'Loại vé',
    soldOut: 'Hết vé',
    available: 'còn lại',
    approve: 'Phê duyệt',
    reject: 'Từ chối',
    approved: '✓ Đã phê duyệt',
    rejected: '✗ Đã từ chối',
    checkInTickets: 'Check-in vé',
    loadingEvent: 'Đang tải sự kiện...',
    failedFetchEventDetails: 'Không thể tải chi tiết sự kiện',
    eventApprovedSuccess: 'Phê duyệt sự kiện thành công',
    failedApproveEvent: 'Không thể phê duyệt sự kiện',
    failedRejectEvent: 'Không thể từ chối sự kiện',
    failedCreateChatRoom: 'Không thể tạo phòng trò chuyện',
    failedUpdateBookmark: 'Không thể cập nhật dấu trang',
    rejectEventTitle: 'Từ chối sự kiện',
    rejectEventMessage: 'Bạn có chắc muốn từ chối sự kiện này không?',
    buyMore: 'Mua thêm',
    buyTicket: 'MUA VÉ',
    eventOrganizer: 'Người tổ chức sự kiện',
    description: 'Mô tả',
  },

  // MyEvent - EventsUpcoming
  eventsUpcoming: {
    noUpcomingEvent: 'Không có sự kiện sắp tới',
    noUpcomingEventDesc: 'Bạn hiện không có sự kiện sắp tới.',
    addEvents: 'THÊM SỰ KIỆN',
  },

  // MyEvent - EventBookmark
  eventBookmark: {
    myFavoriteEvents: 'Sự kiện yêu thích của tôi',
    searchByEventName: 'Tìm kiếm theo tên sự kiện hoặc địa điểm...',
    noResultsFound: 'Không tìm thấy kết quả',
    noFavoriteEvents: 'Chưa có sự kiện yêu thích',
    tryDifferentKeyword: 'Thử tìm kiếm khác.',
    tapHeartIcon: 'Nhấn vào biểu tượng trái tim trên một sự kiện để lưu nó ở đây.',
    exploreEvents: 'Khám phá sự kiện',
  },

  // Communication - Chat
  chatPage: {
    writeReply: 'Viết câu trả lời...',
    noMessagesYet: 'Chưa có tin nhắn. Bắt đầu cuộc trò chuyện!',
  },

  // Communication - Message
  messagePage: {
    message: 'Tin nhắn',
    findUser: 'Tìm người dùng',
    findConversation: 'Tìm cuộc trò chuyện',
    noUsersFound: 'Không tìm thấy người dùng',
    noConversations: 'Chưa có cuộc trò chuyện. Tìm kiếm người dùng để bắt đầu trò chuyện!',
  },

  // Communication - InviteFriend
  inviteFriendPage: {
    inviteFriend: 'Mời bạn',
    searchUsers: 'Tìm kiếm người dùng...',
    searchForUsersToInvite: 'Tìm kiếm người dùng để mời',
    selectAtLeastOne: 'Vui lòng chọn ít nhất một người dùng để mời',
    eventNotFound: 'Không tìm thấy sự kiện',
    invitationsSent: 'Gửi lời mời thành công!',
    failedSendInvitations: 'Không thể gửi lời mời',
    moreResultsBelow: 'Kết quả tiếp theo bên dưới',
  },

  // Checkout - BuyTicket
  buyTicket: {
    ticket: 'Vé',
    noTicketTiers: 'Không có loại vé nào',
    ticketType: 'Loại vé',
    quantity: 'Số lượng',
    available: 'Còn lại',
    pricesSummary: 'Tóm tắt giá',
    calculation: '×',
    totalUSD: 'Tổng cộng',
    soldOut: 'HẾT VÉ',
    continueBuying: 'TIẾP TỤC',
    tickets: 'vé',
    priceSummary: 'Tóm tắt giá',
    total: 'Tổng cộng',
    continue: 'TIẾP TỤC',
  },

  // Checkout - Payment
  payment: {
    payment: 'Thanh toán',
    paymentMethod: 'Phương thức thanh toán',
    wallet: 'Ví',
    paypal: 'PayPal',
    creditDebitCard: 'Thẻ tín dụng / Thẻ ghi nợ',
    yourCards: 'Thẻ của bạn',
    noCardsAdded: 'Chưa thêm thẻ nào',
    addNewCard: 'Thêm thẻ mới',
    totalUSD: 'Tổng cộng',
    checkout: 'THANH TOÁN',
    loginRequired: 'Cần đăng nhập',
    pleaseLogin: 'Vui lòng đăng nhập để tiếp tục',
    selectCard: 'Chọn thẻ',
    selectCardContinue: 'Vui lòng chọn một thẻ để tiếp tục',
    paymentFailed: 'Thanh toán thất bại',
    total: 'Tổng cộng',
  },

  // Checkout - Ticket
  ticketView: {
    tickets: 'Vé',
    noTickets: 'Không có vé',
    noTicketData: 'Không nhận được dữ liệu vé. Vui lòng thử đặt vé lại.',
    goBack: 'Quay lại',
    location: 'Địa điểm',
    date: 'Ngày',
    type: 'Loại',
    seat: 'Chỗ ngồi',
    price: 'Giá',
    downloadAllTickets: 'TẢI XUỐNG TẤT CẢ VÉ',
    ticketSaved: 'Vé đã được lưu! Bạn có thể xem vé của mình bất kỳ lúc nào trong ứng dụng dưới phần \'Vé của tôi\'.',
    failedLoadEventDetails: 'Không thể tải chi tiết sự kiện',
    noTicketDataReceived: 'Chưa nhận được dữ liệu vé. Vui lòng thử đặt vé lại.',
    ticket: 'Vé',
    noEventIdFound: 'Không tìm thấy ID sự kiện',
    ticketsSaved: 'Vé đã được lưu! Bạn có thể xem vé của mình bất kỳ lúc nào trong ứng dụng dưới phần \'Vé của tôi\'.',
  },

  // Drawer Navigation
  drawer: {
    notifications: 'Thông báo',
    addEvent: 'Thêm sự kiện',
    bookmark: 'Lưu lại',
    messages: 'Tin nhắn',
    settings: 'Cài đặt',
    signOut: 'Đăng xuất',
  },

  // Check-in
  // checkIn: {
  //   cameraPermissionRequired: 'Cần cấp quyền camera',
  //   needCameraAccess: 'Chúng tôi cần truy cập camera của bạn để quét mã QR vé',
  //   grantPermission: 'Cấp quyền',
  //   checkInTitle: 'Điểm danh',
  //   alignQRCode: 'Căn chỉnh mã QR trong khung hình',
  //   manualInput: 'Nhập thủ công',
  //   exit: 'Thoát',
  //   checkInSuccess: 'Điểm danh thành công',
  //   passenger: 'Hành khách',
  //   event: 'Sự kiện',
  //   ticketType: 'Loại vé',
  //   seat: 'Chỗ ngồi',
  //   noSeatAssignment: 'Không có chỗ ngồi được gán',
  //   restartingScanner: 'Đang khởi động lại máy quét...',
  //   alreadyChecked: 'Đã điểm danh',
  //   ticketAlreadyChecked: 'Vé này đã được điểm danh rồi',
  //   wrongEvent: 'Sự kiện sai',
  //   wrongEventMessage: 'Mã QR này không thuộc về sự kiện này',
  //   error: 'Lỗi',
  //   tryAgain: 'Thử lại',
  //   processing: 'Đang xử lý...',
  //   enterQRCode: 'Nhập mã QR',
  //   pasteQRData: 'Dán dữ liệu mã QR trực tiếp',
  //   cancel: 'Hủy',
  //   submit: 'Gửi',
  // },

  // // Event Details
  // eventDetails: {
  //   loadingEvent: 'Đang tải sự kiện...',
  //   booked: 'ĐÃ ĐẶT',
  //   membersJoined: 'Thành viên đã tham gia',
  //   eventEnded: 'SỰ KIỆN ĐÃ KẾT THÚC',
  //   invite: 'MỜI',
  //   eventOrganizer: 'Tổ chức sự kiện',
  //   noDescription: 'Không có mô tả',
  //   description: 'Mô tả',
  //   ticketTiers: 'Các loại vé',
  //   soldOut: 'Hết vé',
  //   available: 'còn lại',
  //   approve: 'Phê duyệt',
  //   reject: 'Từ chối',
  //   approved: '✓ Đã phê duyệt',
  //   rejected: '✗ Đã từ chối',
  //   checkInTickets: 'Điểm danh vé',
  //   buyMore: 'Mua thêm',
  //   buyTicket: 'MUA VÉ',
  //   rejectEventTitle: 'Từ chối sự kiện',
  //   rejectEventMessage: 'Bạn có chắc muốn từ chối sự kiện này không?',
  // },

  // // Add Event
  // addEvent: {
  //   events: 'Sự kiện',
  //   cancel: 'Hủy',
  //   editEvent: 'Chỉnh sửa sự kiện',
  //   createEvent: 'Tạo sự kiện',
  //   addCoverImage: 'Thêm ảnh bìa',
  //   eventName: 'Tên sự kiện',
  //   typeEventName: 'Nhập tên sự kiện',
  //   eventType: 'Loại sự kiện',
  //   selectEventType: 'Chọn loại sự kiện',
  //   selectDateTime: 'Chọn ngày & giờ',
  //   location: 'Địa điểm',
  //   enterEventLocation: 'Nhập địa điểm sự kiện',
  //   description: 'Mô tả sự kiện',
  //   typeDescription: 'Nhập mô tả sự kiện của bạn...',
  //   updateEvent: 'CẬP NHẬT SỰ KIỆN',
  //   publishNow: 'XUẤT BẢN NGAY',
  // },

  // Admin
  admin: {
    adminDashboard: 'Bảng điều khiển quản trị',
    messages: 'Tin nhắn',
    searchEvents: 'Tìm kiếm sự kiện...',
    pending: 'Chờ duyệt',
    approved: 'Đã phê duyệt',
    rejected: 'Đã từ chối',
    all: 'Tất cả',
    loadingEvents: 'Đang tải sự kiện...',
    noEvents: 'Không có sự kiện',
    noMatchingEvents: 'Không tìm thấy sự kiện phù hợp',
    noPendingEvents: 'Không có sự kiện chờ duyệt',
    logoutConfirm: 'Bạn có chắc muốn đăng xuất không?',
    failedSignOut: 'Không thể đăng xuất',
  },

  // ActionBar
  actionBar: {
    loginRequired: 'Cần đăng nhập',
    pleaseLogin: 'Vui lòng đăng nhập để xem vé của bạn',
    noTickets: 'Không có vé',
    noTicketsBooked: 'Bạn chưa đặt vé nào',
    failedLoadTickets: 'Không thể tải vé',
    call: 'Gọi',
    myTicket: 'Vé của tôi',
  },

  // EventCard
  eventCard: {
    cannotEdit: 'Không thể chỉnh sửa',
    onlyEditPending: 'Bạn chỉ có thể chỉnh sửa các sự kiện CHỜ DUYỆT. Sự kiện này là',
    cannotDelete: 'Không thể xóa',
    onlyDeletePending: 'Bạn chỉ có thể xóa các sự kiện CHỜ DUYỆT. Sự kiện này là',
    deleteEvent: 'Xóa sự kiện',
    confirmDelete: 'Bạn có chắc muốn xóa sự kiện này không?',
    eventDeletedSuccess: 'Xóa sự kiện thành công',
    failedDeleteEvent: 'Không thể xóa sự kiện',
    joined: 'đã tham gia',
  },

  // AdminEventCard
  adminEventCard: {
    eventApprovedSuccess: 'Phê duyệt sự kiện thành công!',
    failedApproveEvent: 'Không thể phê duyệt sự kiện',
    confirmRejection: 'Xác nhận từ chối',
    confirmRejectEvent: 'Bạn có chắc muốn từ chối sự kiện này không?',
    eventRejectedSuccess: 'Từ chối sự kiện thành công!',
    failedRejectEvent: 'Không thể từ chối sự kiện',
  },

  // EventPriceCard
  eventPriceCard: {
    check: 'XEM',
    joinNow: 'THAM GIA',
  },

  // InvitationCard
  invitationCard: {
    reject: 'Từ chối',
    accept: 'Chấp nhận',
  },

  // TicketTierForm
  ticketTierForm: {
    tierNameRequired: 'Tên loại vé bắt buộc',
    priceMustBePositive: 'Giá phải là số dương',
    quotaMustBeGreater: 'Hạn ngạch phải lớn hơn 0',
    tierNameExists: 'Tên loại vé đã tồn tại',
    ticketTiers: 'Loại vé',
    addTier: 'Thêm loại vé',
    noTiersAdded: 'Chưa thêm loại vé nào',
    price: 'Giá',
    quota: 'Hạn ngạch',
    deleteTier: 'Xóa loại vé',
    confirmDeleteTier: 'Bạn có chắc muốn xóa loại vé này không?',
    tickets: 'vé',
  },

  // UserInviteCard
  userInviteCard: {
    followers: 'người theo dõi',
    invite: 'Mời',
    sent: 'Đã gửi',
  },

  // TicketTierForm Modal
  ticketTierFormModal: {
    editTier: 'Chỉnh sửa loại vé',
    addTier: 'Thêm loại vé',
    tierName: 'Tên loại vé',
    tierNamePlaceholder: 'ví dụ: VIP, Tiêu chuẩn, Kinh tế',
    price: 'Giá ($)',
    pricePlaceholder: '0',
    quota: 'Hạn ngạch (Số lượng vé)',
    quotaPlaceholder: '0',
    editButton: 'Chỉnh sửa',
  },

  // Checkout - Payment
  paymentCheckout: {
    loginRequired: 'Cần đăng nhập',
    pleaseLoginToContinue: 'Vui lòng đăng nhập để tiếp tục',
    failedLoadCards: 'Không thể tải thẻ',
    selectCard: 'Chọn thẻ',
    selectCardToContinue: 'Vui lòng chọn một thẻ để tiếp tục',
    paymentMethod: 'Phương thức thanh toán',
    wallet: 'Ví',
    paypal: 'PayPal',
    creditDebitCard: 'Thẻ tín dụng / Thẻ ghi nợ',
  },

  // Checkout - BuyTicket
  buyTicketPage: {
    pricePerTier: 'Giá',
    available: 'Còn lại',
    noTickets: 'Không có vé',
    noTicketData: 'Không nhận được dữ liệu vé. Vui lòng thử đặt vé lại.',
    goBack: 'Quay lại',
    total: 'Tổng cộng',
    tickets: 'vé',
  },
};


