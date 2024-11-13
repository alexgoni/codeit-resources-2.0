import Button from "@/components/commons/Button";
import TeamsSelectDropdown from "@/components/commons/Dropdown/MultiSelectDropdown/TeamsSelectDropdown";
import Input from "@/components/commons/Input";
import ProfileImage from "@/components/commons/ProfileImage";
import Radio from "@/components/commons/Radio";
import { Team } from "@/lib/api/amplify/helper";
import { TeamInput } from "@/lib/zod-schema/user";
import LoadingSpinner from "@public/gifs/loading-spinner.svg";
import { useFormContext } from "react-hook-form";

interface MemberFormProps {
  teamList: Team[];
  selectedTeams: Team[];
  setSelectedTeams: (value: (prev: Team[]) => Team[]) => void;
  isLoading: boolean;
  mode: "edit" | "add";
  isValidUser?: boolean;
}

function MemberForm({
  teamList,
  selectedTeams,
  setSelectedTeams,
  isLoading,
  mode,
  isValidUser,
}: MemberFormProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useFormContext<TeamInput>();

  const handleSelect = (team: Team) => {
    setSelectedTeams((prev) => [...prev, team]);
  };

  const handleRemove = (team: Team) => {
    setSelectedTeams((prev) => prev.filter((t) => t !== team));
  };

  let buttonLabel;
  if (isLoading) {
    buttonLabel = <LoadingSpinner height={27} width="100%" />;
  } else {
    buttonLabel = mode === "edit" ? "수정하기" : "추가하기";
  }

  return (
    <div className="flex h-[83vh] flex-col justify-between">
      <div className="mt-32 flex flex-1 flex-col gap-24">
        <Radio className="flex gap-24">
          <Radio.Item value="MEMBER" name="role">
            멤버
          </Radio.Item>
          <Radio.Item value="ADMIN" name="role">
            어드민
          </Radio.Item>
        </Radio>
        <Input
          errorMessage={errors.username?.message}
          id="name"
          label="멤버 이름"
          register={register("username")}
        />
        <Input
          errorMessage={errors.email?.message}
          id="email"
          label="멤버 이메일"
          register={register("email")}
          disabled={isValidUser}
        />
        <TeamsSelectDropdown
          selectedTeams={selectedTeams}
          onSelect={handleSelect}
          onRemove={handleRemove}
          departmentList={teamList}
        />
        {mode === "edit" && <ProfileImage size="xl" />}
      </div>

      <div>
        <Button
          disabled={!isValid || selectedTeams.length === 0 || isLoading}
          type="submit"
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}

export default MemberForm;
