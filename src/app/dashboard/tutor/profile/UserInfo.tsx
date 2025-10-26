import React, { useEffect, useState, useCallback } from "react";
import { User, Mail, Tag, Star, Users } from "lucide-react";
import { ratingAPI } from "@/lib/api";

interface UserInfoProps {
  user: any;
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  // Derive tutorId robustly from possible shapes
  const tutorId =
    user?.tutorId ?? null;
  const [ratingSummary, setRatingSummary] = useState<{
    averageRating?: number;
    totalRatings?: number;
  }>({});

  // Modal + all ratings state
  const [showModal, setShowModal] = useState(false);
  const [ratingsData, setRatingsData] = useState<{
    ratings: any[];
    total: number;
    page: number;
    limit: number;
  }>({
    ratings: [],
    total: 0,
    page: 1,
    limit: 5,
  });
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [ratingsError, setRatingsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      if (tutorId) {
        try {
          // use actual user id
          const res = await ratingAPI.getRatingForTutor(Number(tutorId));
          console.log("Rating API response:***********", res);

          const responseData = res as any;

          // If API returns an array of ratings (no summary), compute average
          if (Array.isArray(responseData)) {
            const arr = responseData as any[];
            const total = arr.length;
            const sum = arr.reduce(
              (s, it) =>
                s + (Number(it.ratingValue ?? it.rating ?? it.score ?? 0) || 0),
              0,
            );
            const avg = total > 0 ? sum / total : 0;
            setRatingSummary({ averageRating: avg, totalRatings: total });
            return;
          }

          // Handle wrapped or direct summary formats
          let ratingData;
          if (responseData?.ratingSummary) {
            ratingData = responseData.ratingSummary;
          } else if (
            responseData?.averageRating !== undefined ||
            responseData?.totalRatings !== undefined
          ) {
            ratingData = responseData;
          }

          if (ratingData) {
            setRatingSummary({
              averageRating: Number(ratingData.averageRating) || 0,
              totalRatings: Number(ratingData.totalRatings) || 0,
            });
          }
        } catch (err) {
          console.error("Error fetching rating summary:", err);
        }
      }
    };
    fetchRating();
  }, [tutorId]);

  const fetchRatings = useCallback(
    async (page = 1) => {
      if (!tutorId) return;
      setLoadingRatings(true);
      setRatingsError(null);
      try {
        // use actual user id; if your API supports page/limit params pass them accordingly
        const res = await ratingAPI.getAllRatingsForTutor(Number(tutorId));
        console.log("All Ratings API response:***********", res);
        const dataAny = res as any;

        // Extract raw list depending on shape
        let rawList: any[] = [];
        let total = 0;
        let limitRes = ratingsData.limit;
        let pageRes = page;

        if (Array.isArray(dataAny)) {
          rawList = dataAny;
          total = rawList.length;
        } else {
          rawList =
            dataAny?.ratings ??
            dataAny?.results ??
            (Array.isArray(dataAny) ? dataAny : []);
          total = dataAny?.total ?? dataAny?.count ?? rawList.length;
          pageRes = dataAny?.page ?? page;
          limitRes = dataAny?.limit ?? ratingsData.limit;
        }

        // Normalize each rating object into the shape the modal expects
        const ratings = (rawList ?? []).map((r: any) => ({
          id: r.ratingId ?? r.id,
          reviewerName:
            r.studentName ??
            r.reviewerName ??
            r.userName ??
            r.user ??
            "Anonymous",
          rating: Number(r.ratingValue ?? r.rating ?? r.score) || 0,
          comment: r.reviewText ?? r.comment ?? r.review ?? "",
          createdAt: r.createdAt ?? r.time ?? Date.now(),
          // keep original for debugging if needed
          __raw: r,
        }));

        setRatingsData({ ratings, total, page: pageRes, limit: limitRes });
      } catch (err: any) {
        console.error("Failed to load ratings", err);
        setRatingsError(err?.message ?? "Failed to load reviews");
      } finally {
        setLoadingRatings(false);
      }
    },
    [tutorId, ratingsData.limit],
  );

  const openRatingsModal = () => {
    setShowModal(true);
    // load first page
    fetchRatings(1);
  };

  const closeRatingsModal = () => {
    setShowModal(false);
  };

  const prevPage = () => {
    if (ratingsData.page > 1) fetchRatings(ratingsData.page - 1);
  };

  const nextPage = () => {
    const maxPage = Math.ceil(ratingsData.total / ratingsData.limit) || 1;
    if (ratingsData.page < maxPage) fetchRatings(ratingsData.page + 1);
  };

  return (
    <>
      {user ? (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-6">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-20 h-20 rounded-2xl border-4 border-white/20 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border-4 border-white/20">
                <User className="text-white" size={32} />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 flex-wrap">
                Welcome back, {user.username}!
                
              </h2>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center">
                  <Mail size={16} className="mr-2" />
                  {user.email}
                </div>
                <div className="flex items-center">
                  <Tag size={16} className="mr-2" />
                  {user.role}
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center bg-white/20 rounded-lg px-3 py-1">
                  <Star className="text-yellow-300 mr-1" size={16} />
                  <span className="text-sm font-medium">
                    {ratingSummary.averageRating
                      ? ratingSummary.averageRating.toFixed(1)
                      : "-"}{" "}
                    Rating
                  </span>
                </div>
                <div className="flex items-center bg-white/20 rounded-lg px-3 py-1">
                  <Users className="mr-1" size={16} />
                  <span className="text-sm font-medium">
                    {ratingSummary.totalRatings ?? 0} Reviews
                  </span>
                </div>
                <div>
                  <button
                    onClick={openRatingsModal}
                    className="ml-3 bg-white/20 hover:bg-white/25 text-white rounded-lg px-3 py-1 text-sm"
                  >
                    View all reviews
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-blue-600 bg-blue-50 rounded-2xl">
          <User size={48} className="mx-auto mb-4 text-blue-400" />
          <p className="text-lg font-medium">
            Please log in to view your profile
          </p>
        </div>
      )}

      <RatingsModal
        open={showModal}
        onClose={closeRatingsModal}
        ratingsData={ratingsData}
        loading={loadingRatings}
        error={ratingsError}
        onPrev={prevPage}
        onNext={nextPage}
      />
    </>
  );
};

// Ratings Modal (rendered at component root)
const RatingsModal: React.FC<{
  open: boolean;
  onClose: () => void;
  ratingsData: { ratings: any[]; total: number; page: number; limit: number };
  loading: boolean;
  error: string | null;
  onPrev: () => void;
  onNext: () => void;
}> = ({ open, onClose, ratingsData, loading, error, onPrev, onNext }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-00 rounded-lg max-w-2xl w-full mx-4 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">All Reviews</h3>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-6">{error}</div>
        ) : ratingsData.ratings.length === 0 ? (
          <div className="text-center py-8">No reviews yet.</div>
        ) : (
          <div className="space-y-4">
            {ratingsData.ratings.map((r, idx) => (
              <div key={r.id ?? idx} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {r.reviewerName ?? r.userName ?? r.user ?? "Anonymous"}
                  </div>
                  <div className="text-sm text-yellow-500">
                    {r.rating ?? r.score ?? "-"} ⭐
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {r.comment ?? r.review ?? ""}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(
                    r.createdAt ?? r.time ?? Date.now(),
                  ).toLocaleString()}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total: {ratingsData.total}
              </div>
              <div className="space-x-2">
                <button
                  onClick={onPrev}
                  disabled={ratingsData.page <= 1}
                  className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm">Page {ratingsData.page}</span>
                <button
                  onClick={onNext}
                  disabled={
                    ratingsData.page >=
                    Math.ceil((ratingsData.total || 1) / ratingsData.limit)
                  }
                  className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { RatingsModal };

export default UserInfo;
