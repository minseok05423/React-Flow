const Searchbar = ({
  HandleSubmit,
  searchInput,
  setSearchInput,
}: {
  HandleSubmit: (e: React.FormEvent) => void;
  searchInput: string;
  setSearchInput: (searchInput: string) => void;
}) => {
  return (
    <form onSubmit={HandleSubmit}>
      <label>keyword: </label>
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      ></input>
      <button type="submit">submit</button>
    </form>
  );
};

export default Searchbar;