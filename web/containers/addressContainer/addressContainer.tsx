import React, { useEffect, useRef, useState } from "react";
import useModal from "hooks/useModal";
import usePopover from "hooks/usePopover";
import cls from "./addressContainer.module.scss";
import AddressPopover from "components/addressPopover/addressPopover";
import dynamic from "next/dynamic";
import { useSettings } from "contexts/settings/settings.context";
import { getAddressFromLocation } from "utils/getAddressFromLocation";
import { useMediaQuery } from "@mui/material";
import MobileDrawer from "containers/drawer/mobileDrawer";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useAuth } from "contexts/auth/auth.context";
import SavedAddressList from "./savedAddressList";
import addressService from "services/address";
import { IAddress } from "interfaces/address.interface";
import { ArrowDownIcon, LocationIcon } from "components/icons";

const PopoverContainer = dynamic(() => import("containers/popover/popover"));
const AddressModal = dynamic(
  () => import("components/addressModal/addressModal"),
);

type Props = {};

export default function AddressContainer({}: Props) {
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const addressRef = useRef<any>();
  const [addressModal, handleOpenAddressModal, handleCloseAddressModal] =
    useModal();
  const [
    savedAddressList,
    savedListAnchorEl,
    handleOpenSavedAddressList,
    handleCloseSavedAddressList,
  ] = usePopover();
  const [
    addressPopover,
    anchorEl,
    handleOpenAddressPopover,
    handleCloseAddressPopover,
  ] = usePopover();
  const { address, location, updateAddress, updateLocation } = useSettings();
  const [userAddress, setUserAddress] = useState<string | undefined>(undefined);
  const [userLocation, setUserLocation] = useState("");
  const { query } = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [editedAddress, setEditedAddress] = useState<IAddress | null>(null);

  const { data: addresses } = useQuery(
    ["addresses", user?.id],
    () =>
      addressService.getAll({
        perPage: 100,
      }),
    {
      onSuccess: (res) => {
        if (res.length) {
          const defaultAddress = res.find((item) => Boolean(item.active));
          let latlng: string;
          if (defaultAddress?.location) {
            latlng = `${defaultAddress?.location.at(0)},${defaultAddress.location.at(1)}`;
          } else {
            latlng = location;
          }
          setUserAddress(defaultAddress?.address?.address || "");
          updateAddress(defaultAddress?.address?.address);
          updateLocation(latlng);
        }
      },
      enabled: isAuthenticated,
    },
  );

  useEffect(() => {
    if (!address) {
      window.navigator.geolocation.getCurrentPosition(
        defineLocation,
        defineLocation,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  async function defineLocation(position: any) {
    const { coords } = position;
    let latlng: string;
    if (coords) {
      latlng = `${coords.latitude},${coords.longitude}`;
    } else {
      latlng = location;
    }

    const addr = await getAddressFromLocation(latlng);
    setUserAddress(addr);
    setUserLocation(latlng);
    updateLocation(latlng);
    try {
      addressRef.current.click();
    } catch (err) {
      console.log("err => ", err);
    }
    if (query.g) {
      updateAddress(addr);
      handleCloseAddressPopover();
    }
  }

  const saveAndCloseAddressPopover = () => {
    updateAddress(userAddress);
    handleCloseAddressPopover();
  };

  const handleClickAddressRef = (event: any) => {
    event.stopPropagation();
    handleOpenAddressPopover(event);
  };

  return (
    <>
      <div
        className={cls.address}
        onClick={(e) =>
          isAuthenticated
            ? handleOpenSavedAddressList(e)
            : handleOpenAddressModal()
        }
      >
        <div className={cls.icon}>
          <LocationIcon />
        </div>
        <div
          ref={addressRef}
          onClick={handleClickAddressRef}
          className={cls.text}
        >
          {address}
        </div>
        <ArrowDownIcon />
      </div>
      {isDesktop ? (
        <PopoverContainer
          sx={{ top: 10 }}
          open={addressPopover}
          anchorEl={anchorEl}
          onClose={saveAndCloseAddressPopover}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <AddressPopover
            handleOpenAddressModal={handleOpenAddressModal}
            handleCloseAddressPopover={saveAndCloseAddressPopover}
            defaultAddress={userAddress}
          />
        </PopoverContainer>
      ) : (
        <MobileDrawer
          open={addressPopover}
          onClose={saveAndCloseAddressPopover}
        >
          <AddressPopover
            handleOpenAddressModal={handleOpenAddressModal}
            handleCloseAddressPopover={saveAndCloseAddressPopover}
            defaultAddress={userAddress}
          />
        </MobileDrawer>
      )}
      {isDesktop ? (
        <PopoverContainer
          sx={{ top: 10 }}
          open={savedAddressList}
          anchorEl={savedListAnchorEl}
          onClose={handleCloseSavedAddressList}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <SavedAddressList
            handleOpenAddressModal={handleOpenAddressModal}
            addresses={addresses}
            handleCloseList={handleCloseSavedAddressList}
            onSelectAddress={(value) => {
              setEditedAddress(value);
              handleCloseSavedAddressList();
              handleOpenAddressModal();
            }}
          />
        </PopoverContainer>
      ) : (
        <MobileDrawer
          open={savedAddressList}
          onClose={handleCloseSavedAddressList}
        >
          <SavedAddressList
            handleOpenAddressModal={handleOpenAddressModal}
            addresses={addresses}
            handleCloseList={handleCloseSavedAddressList}
            onSelectAddress={(value) => {
              setEditedAddress(value);
              handleCloseSavedAddressList();
              handleOpenAddressModal();
            }}
          />
        </MobileDrawer>
      )}
      {addressModal && (
        <AddressModal
          open={addressModal}
          onClose={() => {
            handleCloseAddressModal();
            setEditedAddress(null);
          }}
          latlng={editedAddress?.location.join(",") || userLocation || location}
          address={editedAddress?.address?.address || userAddress || address}
          fullScreen={!isDesktop}
          editedAddress={editedAddress}
          onClearAddress={() => setEditedAddress(null)}
        />
      )}
    </>
  );
}
