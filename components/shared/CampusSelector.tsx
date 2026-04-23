"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TbMapPin, TbHome, TbBuilding } from "react-icons/tb";

export interface CampusValue {
  campus: string | null;
  pavillon: string | null;
  room: number | null;
  is_off_campus: boolean;
  off_campus_address: string | null;
}

interface Props {
  value: CampusValue;
  onChange: (value: CampusValue) => void;
  required?: boolean;
  allowOffCampus?: boolean;
  label?: string;
}

interface Campus {
  id: string;
  name: string;
  pavillons: string[];
  max_room: number;
}

export default function CampusSelector({ 
  value, onChange, required = true, allowOffCampus = true, label = "Ou es-tu ?" 
}: Props) {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("campuses").select("*").eq("active", true).order("display_order");
      setCampuses((data as Campus[]) || []);
      setLoading(false);
    })();
  }, []);

  const selectedCampus = campuses.find(c => c.id === value.campus);

  const selectCampus = (campusId: string) => {
    onChange({
      campus: campusId,
      pavillon: null,
      room: null,
      is_off_campus: false,
      off_campus_address: null
    });
  };

  const selectOffCampus = () => {
    onChange({
      campus: null,
      pavillon: null,
      room: null,
      is_off_campus: true,
      off_campus_address: value.off_campus_address || ""
    });
  };

  if (loading) return <div className="text-xs text-gray-400">Chargement...</div>;

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Etape 1 : Choisir le campus */}
      <div className="grid grid-cols-1 gap-2">
        {campuses.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => selectCampus(c.id)}
            className={"flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left " + 
              (value.campus === c.id 
                ? "border-indigo-500 bg-indigo-50" 
                : "border-gray-200 hover:border-gray-300 bg-white")}
          >
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 " +
              (value.campus === c.id ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500")}>
              <TbBuilding size={20}/>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-800">{c.name}</p>
              <p className="text-xs text-gray-400">
                {c.pavillons.length} pavillon{c.pavillons.length > 1 ? "s" : ""} - {c.max_room} chambres
              </p>
            </div>
          </button>
        ))}

        {allowOffCampus && (
          <button
            type="button"
            onClick={selectOffCampus}
            className={"flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left " + 
              (value.is_off_campus 
                ? "border-orange-500 bg-orange-50" 
                : "border-gray-200 hover:border-gray-300 bg-white")}
          >
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 " +
              (value.is_off_campus ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500")}>
              <TbHome size={20}/>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-800">Hors campus</p>
              <p className="text-xs text-gray-400">Adresse libre (en ville)</p>
            </div>
          </button>
        )}
      </div>

      {/* Etape 2a : Si campus -> Pavillon + Chambre */}
      {selectedCampus && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Pavillon *</label>
            <div className="grid grid-cols-3 gap-2">
              {selectedCampus.pavillons.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange({...value, pavillon: p})}
                  className={"py-2 rounded-lg text-sm font-bold transition-all " +
                    (value.pavillon === p 
                      ? "bg-indigo-500 text-white" 
                      : "bg-white text-gray-600 border border-gray-200")}
                >
                  Pav. {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">
              Chambre (1 a {selectedCampus.max_room}) *
            </label>
            <input
              type="number"
              min={1}
              max={selectedCampus.max_room}
              value={value.room || ""}
              onChange={e => {
                const n = parseInt(e.target.value);
                if (!isNaN(n) && n >= 1 && n <= selectedCampus.max_room) {
                  onChange({...value, room: n});
                } else if (e.target.value === "") {
                  onChange({...value, room: null});
                }
              }}
              placeholder="Ex: 23"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {value.pavillon && value.room && (
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-xs text-gray-600">
              <TbMapPin size={14} className="text-indigo-500"/>
              <span className="font-semibold">{selectedCampus.name}</span>
              <span>- Pavillon {value.pavillon}</span>
              <span>- Chambre {value.room}</span>
            </div>
          )}
        </div>
      )}

      {/* Etape 2b : Si hors campus -> Adresse libre */}
      {value.is_off_campus && (
        <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3">
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Ton adresse *</label>
          <textarea
            value={value.off_campus_address || ""}
            onChange={e => onChange({...value, off_campus_address: e.target.value})}
            placeholder="Ex: Route de Rufisque, pres de la pharmacie Diallo"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
      )}
    </div>
  );
}

export const isCampusValueValid = (v: CampusValue): boolean => {
  if (v.is_off_campus) return !!(v.off_campus_address && v.off_campus_address.trim().length > 3);
  if (v.campus) return !!(v.pavillon && v.room && v.room > 0);
  return false;
};

export const formatCampusAddress = (v: CampusValue, campuses?: Campus[]): string => {
  if (v.is_off_campus) return v.off_campus_address || "";
  if (v.campus && v.pavillon && v.room) {
    const c = campuses?.find(cc => cc.id === v.campus);
    return (c?.name || v.campus) + " - Pavillon " + v.pavillon + " - Chambre " + v.room;
  }
  return "";
};
