import Image from "next/image";

interface LinkedInOutputProps {
  content: string;
  author: string;
  style: string;  // Add this line to include the selected style
}

export default function LinkedInOutput({ content, author, style}: LinkedInOutputProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col items-center gap-5 overflow-y-auto bg-gray-50 py-5">
      <div className="mx-auto w-[555px]">
        <div className="font-system overflow-hidden rounded-lg bg-white shadow ring-1 ring-inset ring-gray-200">
          <div className="py-5 pl-4 pr-6">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="relative inline-block shrink-0">
                    <Image
                      alt="Profile picture"
                      width={56}
                      height={56}
                      className="size-14 rounded-full object-cover"
                      src={`/${style}.jpg`}  // Dynamically set the image source based on the style
                    />
                    <span className="absolute bottom-0 right-0 inline-flex size-4 items-center justify-center rounded-full bg-[#1052B8] text-white ring-2 ring-white">
                      <Image
                        src="/post-reactions.svg"
                        alt="Post reactions"
                        width={10}
                        height={10}
                        className="size-2.5"
                      />
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{author}</p>
                    <p className="truncate text-xs font-normal text-gray-500">AI-Generated Content</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-normal text-gray-500">Now</span>
                      <span className="text-xs font-normal text-gray-500">•</span>
                      <svg
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-4 text-gray-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative mt-5 whitespace-pre-wrap">{content}</div>
          </div>
          <div className="relative">
            <div className="overflow-hidden"></div>
          </div>
          <div className="py-3 pl-4 pr-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-start gap-2">
                <Image
                  alt="Post reactions"
                  width={24}
                  height={24}
                  className="h-5 w-auto"
                  src="/post-reactions.svg"
                />
                <span className="mt-1 text-xs font-medium text-gray-500">AI and 88 others</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs font-medium text-gray-500">4 comments</span>
                <span className="text-xs font-medium text-gray-500">•</span>
                <span className="text-xs font-medium text-gray-500">1 repost</span>
              </div>
            </div>
            <hr className="mt-3 border-gray-200" />
            <div className="mt-2 flex items-center justify-between">
              <ActionButton icon={<LikeIcon />} text="Like" />
              <ActionButton icon={<CommentIcon />} text="Comment" />
              <ActionButton icon={<ShareIcon />} text="Share" />
              <ActionButton icon={<SendIcon />} text="Send" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 rounded-lg px-1.5 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100">
      {icon}
      {text}
    </div>
  );
}

function LikeIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 26 26"
      className="size-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M22.75 10.563h-4.874v10.562h4.875a.812.812 0 0 0 .812-.813v-8.937a.812.812 0 0 0-.812-.813v0Z"
      ></path>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m17.876 10.563-4.063-8.126a3.25 3.25 0 0 0-3.25 3.25v2.438H4.28a1.625 1.625 0 0 0-1.613 1.827l1.22 9.75a1.625 1.625 0 0 0 1.612 1.423h12.378"
      ></path>
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 26 26"
      className="size-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5.28 17.976a9.746 9.746 0 1 1 3.41 3.41h0l-3.367.962a.813.813 0 0 1-1.005-1.004l.963-3.368h0ZM10.417 11.375h6.5M10.417 14.625h6.5"
      ></path>
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 26 26"
      className="size-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m18.208 15.438 4.875-4.876-4.875-4.874"
      ></path>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3.583 20.313a9.75 9.75 0 0 1 9.75-9.75h9.75"
      ></path>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 26 26"
      className="size-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21.354 3.644 2.43 8.98"
      ></path>
    </svg>
  );
}
