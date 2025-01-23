import { useEffect, useState } from 'react';
import {
    TableCustom as Table,
    Button,
    ConfirmModal,
    Loader,
} from '../../component';
import { toast } from 'react-toastify';
import { Tag } from 'antd';
import { getReviews } from '../../api/listReviewManagement';

function BoardingHouseReviewManagement() {
    const ratingColors = {
        1: 'red',
        2: 'orange',
        3: 'yellow',
        4: 'lightgreen',
        5: 'green',
    };

    const columns = [
        {
            title: 'Boarding House Name',
            dataIndex: 'boardingHouseId',
            key: 'boardingHouseId',
            render: (house) => house?.name || 'N/A',
        },
        {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => (
                <Tag color={ratingColors[rating]}>
                    {'★'.repeat(rating) + '☆'.repeat(5 - rating)}
                </Tag>
            ),
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('en-GB'),
        },
        {
            title: 'Reviewer',
            dataIndex: 'accountId',
            key: 'accountId',
            render: (account) => account?.fullname || 'N/A',
        },
        {
            title: 'Action',
            render: (record) => (
                <Button
                    title={'Delete'}
                    btnDelete
                    className="btn-delete"
                    onClick={() => handleDeleteModal(record)}
                >
                    Delete
                </Button>
            ),
        },
    ];

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    const fetchData = async () => {
        try {
            const res = await getReviews();
            if (res && res.data) {
                setData(res.data);
                console.log(res);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        }
    };

    const handleDeleteModal = (record) => {
        setSelectedReview(record);
        setIsOpenDeleteModal(true);
    };

    const handleDelete = async () => {

    };

    useEffect(() => {
        fetchData().finally(() => setLoading(false));
    }, []);

    return (
        <div className="txt">
            {loading ? (
                <Loader />
            ) : (
                <>
                    <div className="flex justify-between mb-4">
                        <Button
                            size="large"
                            onClick={() => toast.success('Add success')}
                            btnAdd
                            title={'Add new'}
                        >
                            Add new
                        </Button>
                        <Button
                            btnFilter
                            size="large"
                            onClick={() => toast.success('Filter success')}
                            title={'Filter'}
                        >
                            Filter
                        </Button>
                    </div>
                    <div>
                        <Table columns={columns} data={data || []} loading={loading} />
                    </div>
                    <ConfirmModal
                        title="Confirm Deletion"
                        content="Do you want to delete this review?"
                        onOk={handleDelete}
                        onCancel={() => setIsOpenDeleteModal(false)}
                        isOpen={isOpenDeleteModal}
                    />
                </>
            )}
        </div>
    );
}

export default BoardingHouseReviewManagement;