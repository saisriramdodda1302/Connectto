import axios from "axios";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

// Other accounts to follow; the navbar search drives the ?search= param.
const PeopleWidget = () => {
  const token = useSelector((state) => state.value.token);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/users", {
          params: search ? { search } : {},
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!ignore) setPeople(response.data);
      } catch (err) {
        console.log(err);
        if (!ignore) setPeople([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [search, token]);

  return (
    <WidgetWrapper className="mb-8">
      <h5 className="text-neutral-800 dark:text-gray-100 text-xl font-medium mb-8 transition-colors duration-300">
        {search ? `Results for "${search}"` : "People you may know"}
      </h5>
      <div className="flex flex-col gap-6">
        {loading && (
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Loading...</p>
        )}
        {!loading && people.length === 0 && (
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {search ? "No accounts found." : "No other accounts yet."}
          </p>
        )}
        {people.map((person) => (
          <Friend
            key={person._id}
            friendId={person._id}
            name={`${person.firstname} ${person.lastname}`}
            subtitle={person.occupation || person.location}
            userPicturePath={person.picturepath}
            type="home"
          />
        ))}
      </div>
    </WidgetWrapper>
  );
};

export default PeopleWidget;
