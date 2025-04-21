import React, { useRef, useState } from "react";
import ModalContainer from "containers/modal/modal";
import { DialogProps, useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import cls from "./addressModal.module.scss";
import DarkButton from "components/button/darkButton";
import Map from "components/map/map";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
// import { getAddressFromLocation } from "utils/getAddressFromLocation";
import { Location, OrderFormValues } from "interfaces";
import { FormikProps } from "formik";
import { useMutation, useQuery, useQueryClient } from "react-query";
import shopService from "services/shop";
import { useRouter } from "next/router";
import addressService from "services/address";
import { IAddress } from "interfaces/address.interface";
import { Swiper, SwiperSlide } from "swiper/react";
import AddressCard from "./addressCard";
import { useAuth } from "contexts/auth/auth.context";
import { warning } from "components/alert/toast";
import MapPinAddFillIcon from "remixicon-react/MapPinAddFillIcon";
import dynamic from "next/dynamic";
import useModal from "hooks/useModal";
import { useSettings } from "contexts/settings/settings.context";

const AddressModal = dynamic(
  () => import("components/addressModal/addressModal"),
);

interface Props extends DialogProps {
  address: string;
  latlng: Location;
  formik?: FormikProps<OrderFormValues>;
  addressKey?: string;
  locationKey?: string;
  checkZone?: boolean;
  onSavedAddressSelect?: (address: IAddress | null) => void;
}

export default function DeliveryAddressModal({
  address,
  latlng,
  formik,
  addressKey = "address.address",
  locationKey = "location",
  checkZone = true,
  title,
  onSavedAddressSelect,
  ...rest
}: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [addressModal, handleOpenAddressModal, handleCloseAddressModal] =
    useModal();
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);
  const [location, setLocation] = useState({
    lat: Number(latlng.latitude),
    lng: Number(latlng.longitude),
  });
  const [editedAddress, setEditedAddress] = useState<IAddress | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { query } = useRouter();
  const shopId = Number(query.id);
  const { user, isAuthenticated } = useAuth();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const { location: settingsLocation, address: settingsAddress } =
    useSettings();

  const { data: addresses } = useQuery(
    ["addresses", user?.id],
    () => addressService.getAll({ perPage: 100 }),
    {
      enabled: isAuthenticated,
      staleTime: 0,
      onSuccess: (res) => {
        res?.forEach((item) => {
          if (
            (!selectedAddress && item?.active) ||
            selectedAddress?.id === item?.id
          ) {
            handleChangeAddress(item);
          }
        });
      },
    },
  );
  const { mutate: deleteAddress } = useMutation({
    mutationFn: (id: number) => addressService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries("addresses");
      const prevAddresses = queryClient.getQueryData<IAddress[]>("addresses");

      queryClient.setQueryData<IAddress[] | undefined>(
        ["addresses", user?.id],
        (old) => {
          if (!old) return prevAddresses;
          return old
            .flatMap((addressList) => addressList)
            .filter((oldAddress) => oldAddress.id !== id);
        },
      );
      return { prevAddresses };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(["addresses", user?.id], context?.prevAddresses);
    },
  });

  const { isSuccess } = useQuery(
    ["shopZone", location],
    () =>
      shopService.checkZoneById(shopId, {
        address: { latitude: location.lat, longitude: location.lng },
      }),
    {
      enabled: checkZone,
    },
  );

  function submitAddress() {
    if (!inputRef.current?.value) return warning(t("enter.delivery.address"));
    formik?.setFieldValue(addressKey, inputRef.current?.value);
    formik?.setFieldValue(locationKey, {
      latitude: location.lat,
      longitude: location.lng,
    });
    if (rest.onClose) rest.onClose({}, "backdropClick");
  }

  // function defineAddress() {
  //   window.navigator.geolocation.getCurrentPosition(
  //     defineLocation,
  //     console.log,
  //   );
  // }

  // async function defineLocation(position: any) {
  //   const { coords } = position;
  //   let latlng: string = `${coords.latitude},${coords.longitude}`;
  //   const addr = await getAddressFromLocation(latlng);
  //   if (inputRef.current?.value) inputRef.current.value = addr;
  //   const locationObj = {
  //     lat: coords.latitude,
  //     lng: coords.longitude,
  //   };
  //   setLocation(locationObj);
  // }

  function handleChangeAddress(item: IAddress) {
    setSelectedAddress(item);
    setLocation({
      lat: Number(item?.location?.at(0)),
      lng: Number(item?.location?.at(1)),
    });
    !!onSavedAddressSelect && onSavedAddressSelect(item);
    if (inputRef.current) {
      inputRef.current.value = item?.address?.address as string;
    }
  }

  return (
    <>
      <ModalContainer {...rest}>
        <div className={cls.wrapper}>
          <div className={cls.header}>
            <h1 className={cls.title}>
              {t(title || "enter.delivery.address")}
            </h1>
            <input ref={inputRef} hidden />
            {/*<div className={cls.flex}>*/}
            {/*  <div className={cls.search}>*/}
            {/*    <label htmlFor="search">*/}
            {/*      <Search2LineIcon />*/}
            {/*    </label>*/}
            {/*    <input*/}
            {/*      type="text"*/}
            {/*      id="search"*/}
            {/*      name="search"*/}
            {/*      ref={inputRef}*/}
            {/*      placeholder={t("search")}*/}
            {/*      autoComplete="off"*/}
            {/*      defaultValue={address}*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*  <div className={cls.btnWrapper}>*/}
            {/*    <DarkButton onClick={defineAddress}>*/}
            {/*      <CompassDiscoverLineIcon />*/}
            {/*    </DarkButton>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </div>
          <div className={cls.addressList}>
            <button
              type="button"
              className={cls.addNewAddress}
              onClick={handleOpenAddressModal}
            >
              <MapPinAddFillIcon />
            </button>
            <Swiper
              slidesPerView="auto"
              spaceBetween={10}
              className={cls.swiper}
            >
              {addresses?.map((addressItem) => (
                <SwiperSlide
                  style={{ width: "max-content" }}
                  key={addressItem.id}
                >
                  <AddressCard
                    selectedAddress={selectedAddress}
                    onClick={handleChangeAddress}
                    address={addressItem}
                    onDelete={deleteAddress}
                    onEdit={(address) => {
                      setEditedAddress(address);
                      handleOpenAddressModal();
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className={cls.body}>
            <Map
              location={location}
              setLocation={(value) => {
                setLocation(value);
                setSelectedAddress(null);
                !!onSavedAddressSelect && onSavedAddressSelect(null);
              }}
              inputRef={inputRef}
              readOnly
            />
          </div>
          <div className={cls.form}>
            <DarkButton
              type="button"
              onClick={submitAddress}
              disabled={!isSuccess && checkZone}
            >
              {isSuccess || !checkZone
                ? t("submit")
                : t("delivery.zone.not.available")}
            </DarkButton>
          </div>
          <div className={cls.footer}>
            <button
              className={cls.circleBtn}
              onClick={(event) => {
                if (rest.onClose) rest.onClose(event, "backdropClick");
              }}
            >
              <ArrowLeftLineIcon />
            </button>
          </div>
        </div>
      </ModalContainer>
      {addressModal && (
        <AddressModal
          open={addressModal}
          onClose={() => {
            handleCloseAddressModal();
            setEditedAddress(null);
          }}
          latlng={editedAddress?.location.join(",") || settingsLocation}
          address={editedAddress?.address?.address || settingsAddress}
          fullScreen={!isDesktop}
          editedAddress={editedAddress}
          onClearAddress={() => setEditedAddress(null)}
          onAddAddress={(value: IAddress) => handleChangeAddress(value)}
        />
      )}
    </>
  );
}
