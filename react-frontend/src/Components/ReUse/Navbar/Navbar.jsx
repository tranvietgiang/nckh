import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CiLight } from "react-icons/ci";
import ModelNotifications from "../../Pages/Student/Features/ModalNotifications";
import { getRole } from "../../Constants/INFO_USER";
import IsLogin from "../IsLogin/IsLogin";
import { getAuth } from "../../Constants/INFO_USER";
import { BsMoon } from "react-icons/bs";
import TopLoadingBar from "../TopLoadingBar/TopLoadingBar.jsx";
import useRouteLoading from "../useRouteLoading/useRouteLoading.js";
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
export default function Navbar() {
  const [role, setRole] = useState(null);
  useEffect(() => {
    const roleNow = getRole();
    setRole(roleNow);
  }, []);

  const { user, token } = getAuth();

  IsLogin(user, token);
  const loading = useRouteLoading();
  const navigation = [
    {
      name: "Trang chủ",
      href:
        role === "student"
          ? "/nckh-home"
          : role === "teacher"
          ? "/nckh-teacher"
          : "/nckh-404",
    },
    {
      name: role === "student" ? "Xem báo cáo" : null,
      href:
        role === "student"
          ? "/chưa phát triển"
          : role === "teacher"
          ? "/chưa phát triển"
          : "/nckh-404",
    },
    {
      name: role === "teacher" ? "Quản Lý Báo Cáo" : null,
      href: role === "teacher" ? "/nckh-report-manager" : null,
    },
    {
      name: role === "teacher" ? "Chấm Báo cáo" : null,
      href: role === "teacher" ? "/nckh-teacher-scoringfeedback" : null,
    },
    {
      name: role === "teacher" ? "Quản lý nhóm" : null,
      href: role === "teacher" ? "/nckh-teacher-groups" : null,
    },
  ];

  const [openNotification, setOpenNotification] = useState(false);

  return (
    <div className="sticky top-0 z-50">
      <Disclosure
        as="nav"
        className="relative bg-[#01609a] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10"
      >
        <TopLoadingBar loading={loading} />
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* Mobile menu button*/}
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon
                  aria-hidden="true"
                  className="block size-6 group-data-[open]:hidden"
                />
                <XMarkIcon
                  aria-hidden="true"
                  className="hidden size-6 group-data-[open]:block"
                />
              </DisclosureButton>
            </div>
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex shrink-0 items-center">
                <picture>
                  {/* Mobile - dưới 640px */}
                  <source
                    media="(max-width: 639px)"
                    srcSet="/Images/logo-tdc-orginal.webp"
                  />
                  {/* Tablet - 640px đến 1023px */}
                  <source
                    media="(max-width: 1023px)"
                    srcSet="/Images/tdc-navbar.png"
                  />
                  {/* Desktop - trên 1024px */}
                  <img
                    alt="Your Company"
                    src="/Images/tdc-navbar.png"
                    className="h-8 md:h-10 lg:h-12 xl:h-16 w-auto"
                  />
                </picture>
              </div>
              <div className="hidden sm:ml-6 sm:block flex place-content-center">
                <div className="flex space-x-4 place-content-center">
                  {navigation.map(
                    (item, index) =>
                      item.name !== null && (
                        <a
                          key={item.name || index}
                          href={item.href}
                          aria-current={item.current ? "page" : undefined}
                          className={classNames(
                            item.current
                              ? "bg-gray-950/50 text-white"
                              : "text-gray-300 hover:bg-white/5 hover:text-white",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )}
                        >
                          {item.name}
                        </a>
                      )
                  )}
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              {role === "student" ? (
                <div>
                  <button
                    onClick={() => setOpenNotification(true)}
                    type="button"
                    className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Xem Thông báo</span>
                    <BellIcon aria-hidden="true" className="size-6" />
                  </button>
                  <button>
                    <Menu as="div" className="relative ml-3">
                      <MenuButton className="relative flex rounded-full bg-gray-800 p-1 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        <CiLight
                          size={24}
                          className="text-gray-300 hover:text-yellow-400 transition-colors"
                        />
                      </MenuButton>

                      <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <MenuItem>
                          <button className="flex w-full items-center px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700">
                            <CiLight className="mr-3" size={18} />
                            Sáng
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button className="flex w-full items-center px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700">
                            <BsMoon className="mr-3" size={16} />
                            Tối
                          </button>
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </button>
                </div>
              ) : (
                <Menu as="div" className="relative ml-3">
                  <MenuButton className="relative flex rounded-full bg-gray-800 p-1 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <CiLight
                      size={24}
                      className="text-gray-300 hover:text-yellow-400 transition-colors"
                    />
                  </MenuButton>

                  <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <MenuItem>
                      <button className="flex w-full items-center px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700">
                        <CiLight className="mr-3" size={18} />
                        Sáng
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button className="flex w-full items-center px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700">
                        <BsMoon className="mr-3" size={16} />
                        Tối
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              )}
              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <MenuButton className="relative flex rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <img
                    alt=""
                    src="../../../../public/Images/avatar.png"
                    className="size-8 rounded-full bg-white outline outline-1 -outline-offset-1 outline-white/10"
                  />
                </MenuButton>

                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 outline outline-1 -outline-offset-1 outline-white/10 transition data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  <MenuItem>
                    <Link
                      to="/nckh-profile"
                      className="block px-4 py-2 text-sm text-gray-300 data-[focus]:bg-white/5 data-[focus]:outline-none"
                    >
                      Hồ sơ
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link
                      onClick={() => {
                        localStorage.removeItem("user");
                        localStorage.removeItem("token");
                      }}
                      to="/nckh-login"
                      className="block px-4 py-2 text-sm text-gray-300 data-[focus]:bg-white/5 data-[focus]:outline-none"
                    >
                      Đăng xuất
                    </Link>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>

        <DisclosurePanel className="sm:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigation.map(
              (item) =>
                item.name !== null && (
                  <DisclosureButton
                    key={item.name}
                    as="a"
                    href={item.href}
                    aria-current={item.current ? "page" : undefined}
                    className={classNames(
                      item.current
                        ? "bg-gray-950/50 text-white"
                        : "text-gray-300 hover:bg-white/5 hover:text-white",
                      "block rounded-md px-3 py-2 text-base font-medium"
                    )}
                  >
                    {item.name}
                  </DisclosureButton>
                )
            )}
          </div>
        </DisclosurePanel>

        <ModelNotifications
          stateOpen={openNotification}
          onClose={setOpenNotification}
        />
      </Disclosure>
    </div>
  );
}
