import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import Styles from './Home.module.css';
import BoardingHouseGrid from '../../../component/BoardingHouseCard';
import { Tabs, Button } from 'antd';
import { toast } from 'react-toastify';
import formatAmount from '@/utils/formatAmount';
import { formatTimeAgo } from '../../../utils/timeUtils';
import truncateDetail from '../../../utils/truncateDetail';
import SearchBar from './SearchBar';
import { getBhByArea } from '../../../api/ownerUser/boardingHouse';
import useDebounce from '../../../hooks/useDebounce';
import FilterBoardingHouseUser from './FilterBoardingHouseUser';
import { FilterOutlined, StarFilled } from '@ant-design/icons';
import FilterButton from './FilterButton';
import { useTranslation } from 'react-i18next';

const cx = classNames.bind(Styles);

function Home() {
  const [originalData, setOriginalData] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState({
    province: '',
    district: '',
    ward: '',
  });
  const [filteredData, setFilteredData] = useState(null);
  const [filterValue, setFilterValue] = useState(null);
  const { t } = useTranslation('home');

  const fetchBhByArea = async () => {
    setLoading(true);
    try {
      const combinedFilters = {
        ...searchValue,
        ...filterValue,
      };

      const res = await getBhByArea(combinedFilters);

      const formattedData = res.map((item) => {
        const imgPath =
          item.images?.find((img) => img.isPrimary)?.imageUrl ||
          item.images?.[0]?.imageUrl ||
          '';
        const imgUrl = imgPath ? `${imgPath}` : '';

        return {
          id: item._id?.$oid || item._id,
          name: item.name,
          price: formatAmount(item.priceRange),
          detail: item.address?.province,
          rating: item.rating || 0,
          reviewCount: item.reviewCount || 0,
          img: imgUrl,
          updatedAt: item.updatedAt,
        };
      });

      setOriginalData(formattedData);
      setFilteredData(null);
    } catch (error) {
      console.error('Error fetching boarding houses:', error);
      toast.error('Failed to fetch boarding houses. Please try again later.');
      setOriginalData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBhByArea();
  }, [searchValue, filterValue]);

  const allData = [...originalData].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const newestData = [...originalData]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 10);

  const highRatingData = [...originalData]
    .filter((item) => item.rating >= 3)
    .sort((a, b) => {
      if (b.reviewCount !== a.reviewCount) {
        return b.reviewCount - a.reviewCount;
      }
      return b.rating - a.rating;
    })
    .slice(0, 10);
  const dataToShow = filteredData ?? originalData;
  return (
    <div className="container mx-auto bg-gray-100 dark:bg-gray-700 dark:text-white">
      <SearchBar searchValue={searchValue} setSearchValue={setSearchValue} />

      <div>
        <FilterButton setFilterValue={setFilterValue} />
      </div>
      <div className="flex flex-col md:flex-row max-w-[1200px] mx-auto">
        <div className="mt-8 hidden lg:block w-[250px] ">
          <FilterBoardingHouseUser setFilterValue={setFilterValue} />
        </div>
        <div className={cx('home-container')}>
          <div className={cx('content')}>
            <div className={cx('grid')}>
              {filteredData ? (
                <BoardingHouseGrid data={filteredData} loading={loading} />
              ) : (
                <Tabs defaultActiveKey="all" onChange={setActiveTab}>
                  <Tabs.TabPane tab={t('All')} key="all">
                    <BoardingHouseGrid data={dataToShow} loading={loading} />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={t('newest')} key="newest">
                    <BoardingHouseGrid data={newestData} loading={loading} />
                  </Tabs.TabPane>
                  <Tabs.TabPane tab={t('rating')} key="highRating">
                    <BoardingHouseGrid
                      data={highRatingData}
                      loading={loading}
                    />
                  </Tabs.TabPane>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
