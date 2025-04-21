/* eslint-disable @next/next/no-img-element */
import React, { useMemo, useState } from "react";
import cls from "./branchMap.module.scss";
import MapContainer from "containers/map/mapContainer";
import { IShop } from "interfaces";
import { Skeleton } from "@mui/material";
import StoreCard from "components/storeCard/storeCard";
import PopoverContainer from "containers/popover/popover";
import { useRouter } from "next/router";
import useUserLocation from "hooks/useUserLocation";
import { useBranch } from "contexts/branch/branch.context";

type MarkerProps = {
  data: IShop;
  lat: number;
  lng: number;
  index: number;
  handleHover: (event: any, branch: IShop) => void;
  handleHoverLeave: () => void;
};

const Marker = ({
  data,
  index,
  handleHover,
  handleHoverLeave,
}: MarkerProps) => {
  const { push } = useRouter();
  const { updateBranch } = useBranch();

  const handleClick = () => {
    updateBranch(data);
    push("/");
  };

  return (
    <div
      className={cls.marker}
      onMouseEnter={(event: any) => handleHover(event, data)}
      onMouseLeave={handleHoverLeave}
    >
      <button id={`marker-${index}`} className={cls.mark} onClick={handleClick}>
        {index}
      </button>
    </div>
  );
};

type Props = {
  data?: IShop[];
  isLoading?: boolean;
};

export default function BranchMapSplash({ data = [], isLoading }: Props) {
  const [hoveredBranch, setHoveredBranch] = useState<IShop | undefined>(
    undefined
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const location = useUserLocation();

  const handleOpen = (event: any) => setAnchorEl(event?.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const markers = useMemo(
    () =>
      data.map((item) => ({
        lat: Number(item.location?.latitude) || 0,
        lng: Number(item.location?.longitude) || 0,
        data: item,
      })),
    [data]
  );

  const handleApiLoaded = (map: any, maps: any) => {
    let bounds = new maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
      bounds.extend(markers[i]);
    }
    if (!markers.length) {
      bounds.extend({
        lat: Number(location?.latitude) || 0,
        lng: Number(location?.longitude) || 0,
      });
    }
    map.fitBounds(bounds);
  };

  return (
    <div className={`${cls.wrapper} ${cls.splash}`}>
      {!isLoading ? (
        <MapContainer
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
        >
          {markers.map((item, idx) => (
            <Marker
              key={idx}
              lat={item.lat}
              lng={item.lng}
              data={item.data}
              index={idx + 1}
              handleHover={(event: any, branch: IShop) => {
                setHoveredBranch(branch);
                handleOpen(event);
              }}
              handleHoverLeave={handleClose}
            />
          ))}
        </MapContainer>
      ) : (
        <Skeleton variant="rectangular" className={cls.shimmer} />
      )}

      <PopoverContainer
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableRestoreFocus={true}
        sx={{
          pointerEvents: "none",
        }}
      >
        <div className={cls.float}>
          {!!hoveredBranch && <StoreCard data={hoveredBranch} />}
        </div>
      </PopoverContainer>
    </div>
  );
}
