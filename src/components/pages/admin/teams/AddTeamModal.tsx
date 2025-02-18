/* eslint-disable no-console */
import Button from "@/components/commons/Button";
import Input from "@/components/commons/Input";
import QUERY_KEY from "@/constants/queryKey";
import useModal from "@/hooks/useModal";
import useToast from "@/hooks/useToast";
import { createTeamData } from "@/lib/api/amplify/team";
import { teamZodSchema } from "@/lib/zod-schema/team";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingSpinner from "@public/gifs/loading-spinner.svg";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";

type AddTeamInput = {
  name: string;
};

function AddTeamModal() {
  const { closeModal } = useModal();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AddTeamInput>({
    resolver: zodResolver(teamZodSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AddTeamInput) => createTeamData(data.name),
  });

  const onSubmit: SubmitHandler<AddTeamInput> = async (data) => {
    mutate(data, {
      onSuccess: (res) => {
        if (res.data) {
          success(`${res.data.name} 팀이 추가되었습니다.`);
        } else {
          error("팀을 추가하는데 실패하였습니다.");
        }
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY.TEAM_LIST] });
      },
      onError: (err) => {
        error(err.message || "팀을 추가하는데 실패하였습니다.");
      },
      onSettled: closeModal,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-370 flex-col items-center justify-between rounded-16 bg-white px-32 py-24"
    >
      <h2 className="text-17-500 text-gray-100">팀 추가</h2>
      <p className="text-15-400 text-gray-100-opacity-80">
        추가할 팀 이름을 입력해주세요.
      </p>
      <div className="my-20 flex w-full flex-col gap-8">
        <Input
          register={register("name")}
          label="팀 이름"
          id="teamName"
          errorMessage={errors.name?.message}
        />
      </div>
      <div className="flex justify-between gap-20">
        <Button
          onClick={closeModal}
          variant="secondary"
          size="modal"
          width="w-86"
          height="h-40"
        >
          취소하기
        </Button>
        <Button
          type="submit"
          size="modal"
          width="w-86"
          height="h-40"
          disabled={!isValid || isPending}
        >
          {isPending ? <LoadingSpinner height={27} width="100%" /> : "추가하기"}
        </Button>
      </div>
    </form>
  );
}

export default AddTeamModal;
