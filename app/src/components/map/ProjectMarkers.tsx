"use client";

import { useMemo, useCallback } from "react";
import { Marker, Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { Project } from "@/lib/schemas/project";
import { createProjectIcon, createClusterIcon } from "@/lib/utils/markerIcons";
import { formatBudget, getLocalizedName } from "@/lib/utils/format";

interface ProjectMarkersProps {
  projects: Project[];
  locale: string;
  onProjectClick?: (project: Project) => void;
}

export function ProjectMarkers({
  projects,
  locale,
  onProjectClick,
}: ProjectMarkersProps) {
  // Filter to only projects with coordinates
  const projectsWithCoords = useMemo(() => {
    return projects.filter(
      (p) =>
        p.location.coordinates?.latitude && p.location.coordinates?.longitude
    );
  }, [projects]);

  // Create markers
  const markers = useMemo(() => {
    return projectsWithCoords.map((project) => {
      const { latitude, longitude } = project.location.coordinates!;
      const icon = createProjectIcon(project.type, project.status);

      return {
        project,
        position: [latitude, longitude] as [number, number],
        icon,
      };
    });
  }, [projectsWithCoords]);

  const handleMarkerClick = useCallback(
    (project: Project) => {
      onProjectClick?.(project);
    },
    [onProjectClick]
  );

  if (markers.length === 0) {
    return null;
  }

  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={createClusterIcon}
      maxClusterRadius={50}
      spiderfyOnMaxZoom={true}
      showCoverageOnHover={false}
      zoomToBoundsOnClick={true}
      disableClusteringAtZoom={13}
    >
      {markers.map(({ project, position, icon }) => (
        <Marker
          key={project.id}
          position={position}
          icon={icon}
          eventHandlers={{
            click: () => handleMarkerClick(project),
          }}
        >
          <Tooltip direction="top" offset={[0, -14]} className="project-tooltip">
            <div className="max-w-[200px]">
              <p className="font-semibold text-navy-900 text-sm leading-tight">
                {getLocalizedName(project.name, locale === "ta" ? "ta" : "en")}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                <span>{project.status}</span>
                {project.budget?.crore && (
                  <>
                    <span>•</span>
                    <span>{formatBudget(project.budget, locale)}</span>
                  </>
                )}
              </div>
            </div>
          </Tooltip>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}
